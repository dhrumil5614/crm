const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_URL = 'http://localhost:5001/api';

// Simple check if routes return 401 (meaning they are there but protected)
// or 404 (meaning they are missing)
const checkRoutes = async () => {
    try {
        console.log('Testing Lead Routes...');
        try {
            await axios.get(`${API_URL}/leads`);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('✅ POST /api/leads is protected (401) - Route Exists');
            } else {
                console.log(`❌ Lead Route Error: ${err.message}`);
            }
        }

        console.log('Testing Account Routes...');
        try {
            await axios.get(`${API_URL}/accounts`);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('✅ POST /api/accounts is protected (401) - Route Exists');
            } else {
                console.log(`❌ Account Route Error: ${err.message}`);
            }
        }

        console.log('Testing Opportunity Routes...');
        try {
            await axios.get(`${API_URL}/opportunities`);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('✅ POST /api/opportunities is protected (401) - Route Exists');
            } else {
                console.log(`❌ Opportunity Route Error: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

checkRoutes();
