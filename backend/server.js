const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initAutomation } = require('./automation/watchers');
const http = require('http');
const { init: initRealtime } = require('./utils/realtime');

// Import Routes
const AccountRoutes = require("./routes/accounts");
const ContactRoutes = require("./routes/contacts");
const leadRoutes = require('./routes/leadRoute');
const opportunityRoutes = require('./routes/opportunityRoute');
const quoteRoutes = require('./routes/quoteRoute');
const orderRoutes = require('./routes/ordersRoute');
const tasksRoutes = require('./routes/tasksRoute');
const appointmentsRoutes = require('./routes/appointmentsRoute');
const emailRoutes = require('./routes/emailsRoute');
const authRoutes = require('./routes/authRoutes');
const competitorRoutes = require('./routes/competitorRoute');
const supplierRoutes = require('./routes/supplierRoute');
const supplierContactRoutes = require('./routes/supplierContactRoute');
const productRoutes = require('./routes/productRoute');

const app = express();

// Enable CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Express middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
connectDB();
// Initialize automation watchers once DB is ready
initAutomation();

// Test Route
app.get("/", (req, res) => {
  res.send("API is running and MongoDB is connected!");
});

// Routes
app.use("/api/accounts", AccountRoutes);
app.use("/api/contacts", ContactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/opportunity', opportunityRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/supplier-contacts', supplierContactRoutes);
app.use('/api/products', productRoutes);

// Start server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initRealtime(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});