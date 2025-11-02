const mongoose = require('mongoose');

const Lead = require('../models/Leads');
const Opportunity = require('../models/Opportunity');
const Quote = require('../models/Quote');
const Orders = require('../models/SalesOrder');
const AutomationLog = require('../models/AutomationLog');
const { emitAutomation } = require('../utils/realtime');

function log(action, payload = {}) {
  try {
    const entry = new AutomationLog(payload);
    entry.action = action;
    return entry.save().catch(() => {});
  } catch (_) {
    // no-op
  }
}

async function updateOpportunityForQuoteStatus(quote) {
  try {
    if (!quote) return;
    const status = String(quote.status || '').trim().toLowerCase();
    if (status !== 'no order') return;
    // Find linked opportunity
    let opportunityId = quote.opportunityId || null;
    if (!opportunityId) {
      const opp = await Opportunity.findOne({ linkedQuoteId: quote.quoteId }).lean().catch(() => null);
      if (opp) opportunityId = opp.opportunityId;
    }
    if (opportunityId) {
      await Opportunity.updateOne({ opportunityId }, { $set: { status: 'Lost' } }).catch(() => {});
      await log('Quote→Opportunity Lost', {
        sourceCollection: 'Quote',
        sourceId: quote.quoteId,
        targetCollection: 'Opportunity',
        targetId: opportunityId,
        details: { reason: 'Quote status = No Order' }
      });
      emitAutomation('warning', '⚠️ Opportunity marked as Lost', {
        quoteId: quote.quoteId,
        opportunityId,
      });
    }
  } catch (_) {}
}

function initMiddlewareFallback() {
  // Lead hooks
  try {
    Lead.schema.post('save', async function(doc) {
      try { if (String(doc.status).toLowerCase() === 'qualified') await ensureOpportunityForQualifiedLead(doc); } catch (_) {}
    });
    Lead.schema.post('findOneAndUpdate', async function(res) {
      try {
        const doc = await Lead.findOne(this.getQuery()).lean();
        if (doc && String(doc.status).toLowerCase() === 'qualified') await ensureOpportunityForQualifiedLead(doc);
      } catch (_) {}
    });
  } catch (_) {}

  // Opportunity hooks
  try {
    Opportunity.schema.post('save', async function(doc) {
      try { await ensureQuoteForOpportunityPhase(doc); } catch (_) {}
    });
    Opportunity.schema.post('findOneAndUpdate', async function() {
      try {
        const doc = await Opportunity.findOne(this.getQuery()).lean();
        if (doc) await ensureQuoteForOpportunityPhase(doc);
      } catch (_) {}
    });
  } catch (_) {}

  // Quote hooks
  try {
    Quote.schema.post('save', async function(doc) {
      try { await ensureOrderForQuoteStatus(doc); await updateOpportunityForQuoteStatus(doc); } catch (_) {}
    });
    Quote.schema.post('findOneAndUpdate', async function() {
      try {
        const doc = await Quote.findOne(this.getQuery()).lean();
        if (doc) { await ensureOrderForQuoteStatus(doc); await updateOpportunityForQuoteStatus(doc); }
      } catch (_) {}
    });
  } catch (_) {}

  // Orders hooks
  try {
    Orders.schema.post('save', async function(doc) {
      try { await propagateOrderStatus(doc); } catch (_) {}
    });
    Orders.schema.post('findOneAndUpdate', async function() {
      try {
        const doc = await Orders.findOne(this.getQuery()).lean();
        if (doc) await propagateOrderStatus(doc);
      } catch (_) {}
    });
  } catch (_) {}

  log('WatcherFallbackEnabled', { sourceCollection: 'init', sourceId: 'middleware' });
}

async function supportsChangeStreams() {
  try {
    const admin = mongoose.connection.db.admin();
    // hello works on modern MongoDB; fall back to ismaster on older
    let info;
    try {
      info = await admin.command({ hello: 1 });
    } catch (_) {
      info = await admin.command({ ismaster: 1 });
    }
    // Change streams require a replica set (setName present)
    return Boolean(info && (info.setName || info.msg === 'isdbgrid'));
  } catch (e) {
    await log('WatcherInitError', { sourceCollection: 'init', sourceId: 'support-check', details: { error: e?.message } });
    return false;
  }
}

async function ensureOpportunityForQualifiedLead(lead) {
  if (!lead) return;
  if (lead.linkedOpportunityId) return; // already linked

  const existing = await Opportunity.findOne({ leadId: lead.leadId }).lean();
  if (existing) return;

  const opp = await Opportunity.create({
    name: lead.name || `Opportunity ${lead.leadId}`,
    account: lead.account || '',
    contact: lead.contact || '',
    email: lead.email || '',
    mobile: lead.mobile || '',
    city: lead.city || '',
    state: lead.state || '',
    country: lead.country || '',
    owner: lead.owner || 'user1',
    salesPhase: 'qualification',
    status: 'Open',
    leadId: lead.leadId,
    expectedValue: 0,
  });

  await Lead.updateOne({ _id: lead._id }, { $set: { linkedOpportunityId: opp.opportunityId } });

  await log('Lead→Opportunity', {
    sourceCollection: 'Lead',
    sourceId: lead.leadId,
    targetCollection: 'Opportunity',
    targetId: opp.opportunityId,
    details: { reason: 'Lead qualified' }
  });
  emitAutomation('success', '✅ Lead converted to Opportunity successfully', {
    leadId: lead.leadId,
    opportunityId: opp.opportunityId,
  });
}

async function ensureQuoteForOpportunityPhase(opportunity) {
  if (!opportunity) return;
  // Only when moved to quotation phase
  if (String(opportunity.salesPhase || '').trim().toLowerCase() !== 'quotation') return;
  if (opportunity.linkedQuoteId) return;

  const existing = await Quote.findOne({ opportunityId: opportunity.opportunityId }).lean();
  if (existing) return;

  const quote = await Quote.create({
    account: opportunity.account || '',
    contact: opportunity.contact || '',
    email: opportunity.email || '',
    mobile: opportunity.mobile || '',
    city: opportunity.city || '',
    state: opportunity.state || '',
    country: opportunity.country || '',
    owner: opportunity.owner || '',
    amount: opportunity.expectedValue || 0,
    status: 'Open',
    opportunityId: opportunity.opportunityId,
    leadId: opportunity.leadId || null,
  });

  await Opportunity.updateOne({ _id: opportunity._id }, { $set: { linkedQuoteId: quote.quoteId } });
  if (opportunity.leadId) {
    await Lead.updateOne({ leadId: opportunity.leadId }, { $set: { linkedQuoteId: quote.quoteId } }).catch(() => {});
  }

  await log('Opportunity→Quote', {
    sourceCollection: 'Opportunity',
    sourceId: opportunity.opportunityId,
    targetCollection: 'Quote',
    targetId: quote.quoteId,
    details: { reason: 'Opportunity phase = quotation' }
  });
  emitAutomation('info', '📄 Sales Quotation created', {
    opportunityId: opportunity.opportunityId,
    quoteId: quote.quoteId,
  });
}

async function ensureOrderForQuoteStatus(quote) {
  if (!quote) return;
  if (String(quote.status || '').trim().toLowerCase() !== 'order') return;
  if (quote.linkedOrderId) return;

  const existing = await Orders.findOne({ quoteId: quote.quoteId }).lean();
  if (existing) return;

  const order = await Orders.create({
    account: quote.account || '',
    primaryContact: quote.contact || '',
    email: quote.email || '',
    mobile: quote.mobile || '',
    city: quote.city || '',
    state: quote.state || '',
    country: quote.country || '',
    amount: quote.amount || 0,
    owner: quote.owner || '',
    status: 'Active',
    quoteId: quote.quoteId,
    opportunityId: quote.opportunityId || null,
    leadId: quote.leadId || null,
  });

  // Link back
  await Quote.updateOne({ _id: quote._id }, { $set: { linkedOrderId: order.orderId } });
  let opportunityId = quote.opportunityId || null;
  if (!opportunityId) {
    const opp = await Opportunity.findOne({ linkedQuoteId: quote.quoteId }).lean().catch(() => null);
    if (opp) opportunityId = opp.opportunityId;
  }
  if (opportunityId) {
    await Opportunity.updateOne({ opportunityId }, { $set: { linkedOrderId: order.orderId, status: 'Won' } }).catch(() => {});
  }
  if (quote.leadId) {
    await Lead.updateOne({ leadId: quote.leadId }, { $set: { linkedOrderId: order.orderId } }).catch(() => {});
  }

  await log('Quote→Order', {
    sourceCollection: 'Quote',
    sourceId: quote.quoteId,
    targetCollection: 'Orders',
    targetId: order.orderId,
    details: { reason: 'Quote status = Order' }
  });
  emitAutomation('success', '💼 Sales Order generated and Opportunity marked as Won', {
    quoteId: quote.quoteId,
    orderId: order.orderId,
    opportunityId: quote.opportunityId || opportunityId,
  });
}

async function propagateOrderStatus(order) {
  if (!order) return;
  let oppId = order.opportunityId;
  if (!oppId) {
    // Try to resolve via Opportunity.linkedOrderId
    const oppByOrder = await Opportunity.findOne({ linkedOrderId: order.orderId }).lean().catch(() => null);
    if (oppByOrder) oppId = oppByOrder.opportunityId;
  }
  if (!oppId && order.quoteId) {
    // Try to resolve via Quote
    const quote = await Quote.findOne({ quoteId: order.quoteId }).lean().catch(() => null);
    if (quote?.opportunityId) oppId = quote.opportunityId;
    if (!oppId && quote?.quoteId) {
      const oppByQuote = await Opportunity.findOne({ linkedQuoteId: quote.quoteId }).lean().catch(() => null);
      if (oppByQuote) oppId = oppByQuote.opportunityId;
    }
  }
  if (!oppId) return;

  const st = String(order.status || '').trim().toLowerCase();
  if (st === 'completed') {
    await Opportunity.updateOne({ opportunityId: oppId }, { $set: { status: 'Closed Won' } });
    await log('Order→Opportunity Closed Won', {
      sourceCollection: 'Orders',
      sourceId: order.orderId,
      targetCollection: 'Opportunity',
      targetId: oppId,
      details: { reason: 'Sales Order Completed' }
    });
    emitAutomation('success', '🎉 Sales Order Completed — Project Closed Successfully', {
      orderId: order.orderId,
      opportunityId: oppId,
    });
  } else if (st === 'cancelled') {
    await Opportunity.updateOne({ opportunityId: oppId }, { $set: { status: 'Lost' } });
    await log('Order→Opportunity Lost', {
      sourceCollection: 'Orders',
      sourceId: order.orderId,
      targetCollection: 'Opportunity',
      targetId: oppId,
      details: { reason: 'Sales Order Cancelled' }
    });
    emitAutomation('warning', '⚠️ Opportunity marked as Lost', {
      orderId: order.orderId,
      opportunityId: oppId,
    });
  }
}

function initLeadWatcher() {
  try {
    const collection = mongoose.connection.collection('leads');
    if (!collection) return;
    const pipeline = [
      { $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }
    ];
    const changeStream = collection.watch(pipeline, { fullDocument: 'updateLookup' });
    changeStream.on('error', (err) => {
      log('WatcherRuntimeError', { sourceCollection: 'Lead', sourceId: 'stream', details: { error: err?.message } });
    });
    changeStream.on('close', () => {
      log('WatcherClosed', { sourceCollection: 'Lead', sourceId: 'stream' });
    });
    changeStream.on('change', async (change) => {
      try {
        const doc = change.fullDocument;
        if (!doc) return;
        // Trigger when status becomes qualified OR on insert with qualified
        if (String(doc.status).toLowerCase() === 'qualified') {
          await ensureOpportunityForQualifiedLead(doc);
        }
      } catch (err) {
        await log('Error', { sourceCollection: 'Lead', sourceId: change.documentKey?._id?.toString?.(), details: { error: err?.message } });
      }
    });
  } catch (e) {
    log('WatcherInitError', { sourceCollection: 'Lead', sourceId: 'init', details: { error: e?.message } });
  }
}

function initOpportunityWatcher() {
  try {
    const collection = mongoose.connection.collection('opportunities');
    if (!collection) return;
    const pipeline = [
      { $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }
    ];
    const changeStream = collection.watch(pipeline, { fullDocument: 'updateLookup' });
    changeStream.on('change', async (change) => {
      try {
        const doc = change.fullDocument;
        if (!doc) return;
        await ensureQuoteForOpportunityPhase(doc);
      } catch (err) {
        await log('Error', { sourceCollection: 'Opportunity', sourceId: change.documentKey?._id?.toString?.(), details: { error: err?.message } });
      }
    });
  } catch (e) {
    log('WatcherInitError', { sourceCollection: 'Opportunity', sourceId: 'init', details: { error: e?.message } });
  }
}

function initQuoteWatcher() {
  try {
    const collection = mongoose.connection.collection('quotes');
    if (!collection) return;
    const pipeline = [
      { $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }
    ];
    const changeStream = collection.watch(pipeline, { fullDocument: 'updateLookup' });
    changeStream.on('change', async (change) => {
      try {
        const doc = change.fullDocument;
        if (!doc) return;
        await ensureOrderForQuoteStatus(doc);
        await updateOpportunityForQuoteStatus(doc);
      } catch (err) {
        await log('Error', { sourceCollection: 'Quote', sourceId: change.documentKey?._id?.toString?.(), details: { error: err?.message } });
      }
    });
  } catch (e) {
    log('WatcherInitError', { sourceCollection: 'Quote', sourceId: 'init', details: { error: e?.message } });
  }
}

function initOrderWatcher() {
  try {
    const collection = mongoose.connection.collection('orders');
    if (!collection) return;
    const pipeline = [
      { $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }
    ];
    const changeStream = collection.watch(pipeline, { fullDocument: 'updateLookup' });
    changeStream.on('change', async (change) => {
      try {
        const doc = change.fullDocument;
        if (!doc) return;
        await propagateOrderStatus(doc);
      } catch (err) {
        await log('Error', { sourceCollection: 'Orders', sourceId: change.documentKey?._id?.toString?.(), details: { error: err?.message } });
      }
    });
  } catch (e) {
    log('WatcherInitError', { sourceCollection: 'Orders', sourceId: 'init', details: { error: e?.message } });
  }
}

async function initAutomation() {
  const conn = mongoose.connection;
  const startWatchers = async () => {
    const supported = await supportsChangeStreams();
    if (!supported) {
      initMiddlewareFallback();
      return;
    }
    initLeadWatcher();
    initOpportunityWatcher();
    initQuoteWatcher();
    initOrderWatcher();
  };

  if (conn.readyState === 1) {
    await startWatchers();
    return;
  }
  conn.once('open', () => { startWatchers(); });
}

module.exports = { initAutomation, ensureQuoteForOpportunityPhase, ensureOrderForQuoteStatus, updateOpportunityForQuoteStatus, propagateOrderStatus };
