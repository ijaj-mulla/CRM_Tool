import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_PREFIX } from '@/config/api';

const DEMO_EMAILS = [
  {
    _id: 'demo1',
    from: 'Airtel India <no-reply@airtel.in>',
    subject: 'Your Airtel bill for November 2025',
    date: new Date().toISOString(),
    snippet: 'Dear Customer, your Airtel postpaid bill is now available. Pay before 15 Nov to avoid late fee.'
  },
  {
    _id: 'demo2',
    from: 'IRCTC <tickets@irctc.co.in>',
    subject: 'E-Ticket Booking Confirmation - NDLS to BCT',
    date: new Date(Date.now() - 86400000).toISOString(),
    snippet: 'PNR 2456789012 confirmed. Coach B2, Seat 23. Boarding at New Delhi. Have a pleasant journey.'
  },
  {
    _id: 'demo3',
    from: 'SBI Cards <alerts@sbicard.com>',
    subject: 'Transaction Alert: INR 2,499 at Amazon.in',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    snippet: 'A transaction of INR 2,499 has been made on your SBI Card ending 1234. If not you, call helpline immediately.'
  },
  {
    _id: 'demo4',
    from: 'Flipkart <no-reply@flipkart.com>',
    subject: 'Your order has been shipped',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    snippet: 'Order OD123456789 is on the way. Expected delivery: 05 Nov. Track your package in the Flipkart app.'
  },
  {
    _id: 'demo5',
    from: 'HDFC Bank <alerts@hdfcbank.net>',
    subject: 'NetBanking OTP for login',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    snippet: 'Use OTP 864213 to login. Do not share this with anyone. HDFC Bank will never ask for your OTP.'
  }
];

const EmailsPage = () => {
  const location = useLocation();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const forceDemo = (import.meta.env.VITE_FORCE_DEMO_EMAILS === 'true') || (new URLSearchParams(location.search).get('demo') === '1');

  // Fetch emails from backend
  const fetchEmails = async () => {
    try {
      const response = await axios.get(`${API_PREFIX}/emails`);
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setEmails([]);
    }
  };

  // Sync emails with Gmail
  const handleSync = async () => {
    setLoading(true);
    setSyncStatus('');
    try {
      const response = await axios.post(`${API_PREFIX}/emails/sync`);
      setSyncStatus(`${response.data.newEmailsCount} new emails synced`);
      fetchEmails(); // Refresh the email list
    } catch (error) {
      console.error('Error syncing emails:', error);
      setSyncStatus('Error syncing emails');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Emails</h2>
          <div className="flex items-center gap-4">
            {syncStatus && (
              <span className="text-sm text-gray-600">{syncStatus}</span>
            )}
            <button
              onClick={handleSync}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Emails'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Snippet</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {((!forceDemo && emails && emails.length > 0) ? emails : DEMO_EMAILS).map((email) => (
                <tr key={email._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.from}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(email.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="truncate max-w-md">{email.snippet}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailsPage;