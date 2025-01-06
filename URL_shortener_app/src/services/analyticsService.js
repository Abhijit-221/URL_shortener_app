const Analytics = require('../models/analytics');
const geoip = require('geoip-lite');

const logRedirectEvent = async (req, urlId) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const geoData = geoip.lookup(ip) || {};

        const analyticsData = {
            urlId,
            timestamp: new Date(),
            userAgent: req.headers['user-agent'],
            ipAddress: ip,
            geoLocation: {
                country: geoData.country || 'Unknown',
                region: geoData.region || 'Unknown',
                city: geoData.city || 'Unknown',
            },
        };

        // Save analytics data to the database
        await Analytics.create(analyticsData);
    } catch (error) {
        console.error('Failed to log analytics:', error);
    }
};

module.exports = { logRedirectEvent };
