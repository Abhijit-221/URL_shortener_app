const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    longUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        unique: true,
        required: true,
    },
    customAlias: {
        type: String,
        unique: true,
        sparse: true, // Allows null or unique
    },
    topic: {
        type: String,
        default: "general",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Url = mongoose.model('Url', UrlSchema);
module.exports=Url;
