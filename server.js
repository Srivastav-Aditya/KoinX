// Importing necessary libraries
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cron = require('node-cron');
const database = require('./config/database');
const Crypto = require('./model/Crypto');

const dotenv = require("dotenv");
dotenv.config();
// Initializing Express app
const app = express();
app.use(express.json());

// MongoDB connection mongodb:
database.connect();
// Task 1: Fetch and store cryptocurrency data in MongoDB every hour
async function updateCryptoData() {
    try { 
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
        const cryptoList = response.data;

        // Clear existing data
        await Crypto.deleteMany({}, { writeConcern: { wtimeout: 0 } });

        // Insert new data
        await Crypto.insertMany(cryptoList);
        console.log('Cryptocurrency data updated successfully!');
    } catch (error) {
        console.error('Error updating cryptocurrency data:', error.message);
    }
}

// Initial data update
updateCryptoData();

// Schedule data update every hour
cron.schedule('0 * * * *', () => {
    updateCryptoData();
});

// Task 2: API endpoint to get cryptocurrency price on a particular date
app.get('/price', async (req, res) => {
    try {
        const { fromCurrency, toCurrency, date } = req.query;
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${fromCurrency}/history?date=${date}`);
        const priceData = response.data.market_data.current_price;

        if (toCurrency in priceData) {
            res.json({ price: priceData[toCurrency] });
        } else {
            res.status(404).json({ error: 'Currency not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Task 3: API endpoint to get list of companies holding a cryptocurrency
app.get('/companies', async (req, res) => {
    try {
        const { currency } = req.query;
        const response = await axios.get(`https://api.coingecko.com/api/v3/companies/public_treasury?coin_id=${currency}`);
        const companies = response.data.map(company => company.company_name);
        res.json({ companies });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
