const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Url',
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    geoLocation: {
        country: String,
        region: String,
        city: String,
    },
});

const Analytics = mongoose.model('Analytics', AnalyticsSchema);
module.exports = Analytics;
