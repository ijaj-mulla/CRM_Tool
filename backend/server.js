const express = require("express");
const connectDB = require("./config/db");

connectDB();

const AccountRoutes = require("./routes/accounts");
const ContactRoutes = require("./routes/contacts");
const leadRoutes = require('./routes/leadRoute');
const opportunityRoutes = require('./routes/opportunityRoute');
const quoteRoutes = require('./routes/quoteRoute');
const orderRoutes = require('./routes/ordersRoute');
const tasksRoutes = require('./routes/tasksRoute');
const appointmentsRoutes = require('./routes/appointmentsRoute');

const app = express();
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("API is running and MongoDB is connected!");
});

//cors 
const cors = require('cors');
app.use(cors());

//Account Routes
app.use("/api/accounts", AccountRoutes);

//Contact Routes
app.use("/api/contacts", ContactRoutes);

//Leads Routes
app.use('/api/leads', leadRoutes);

//opportunity Routes
app.use('/api/opportunity', opportunityRoutes);

//quotes Routes
app.use('/api/quotes',quoteRoutes );

//orders Routes
app.use('/api/orders',orderRoutes );

//tasks Routes
app.use('/api/tasks', tasksRoutes);

//appointments Routes
app.use('/api/appointments', appointmentsRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
