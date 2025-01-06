const redisClient = require('../../config/redisClient');
const Url = require('../../models/urlModel');
const { logRedirectEvent } = require('../../services/analyticsService');

// Helper function to generate a unique short URL
const generateShortUrl = async (customAlias) => {
    if (customAlias) {
        const exists = await Url.findOne({ customAlias });
        if (exists) throw new Error('Custom alias already in use');
        return customAlias;
    }
    return nanoid(8); // Generate an 8-character unique ID
};

module.exports = {
    /**
     * @filename urlShortener.js
     * @method POST
     * @router /api/shorten
     * @auther Abhijit swain
     * @description make url short.
    */
    createShortUrl: async (req, res) => {

        try {
            const { longUrl, customAlias, topic } = req.body;
            const userId = req.user.id;

            if (!longUrl) {
                return res.status(400).json({
                    status: 400,
                    data: {},
                    error: 'longUrl is required',
                    message: 'longUrl is required'
                });
            }

            // Generate or validate the short URL alias
            const alias = await generateShortUrl(customAlias);

            // Construct the short URL
            const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
            const shortUrl = `${baseUrl}/${alias}`;

            // Save the URL to the database
            const newUrl = await Url.create({
                longUrl,
                shortUrl,
                customAlias: customAlias || alias,
                topic: topic || "general",
                userId,
            });
            // Cache the short URL
            await redisClient.setEx(alias, 3600, longUrl);
            res.status(201).json({
                status: 201,
                data: {
                    shortUrl: newUrl.shortUrl,
                    createdAt: newUrl.createdAt,
                },
                error: '',
                message: 'URL shortened successfully',
            });
        } catch (error) {
            console.error(error);
            if (error.message === 'Custom alias already in use') {
                return res.status(409).json({
                    status: 409,
                    data: {},
                    error: error.message,
                    message: 'Custom alias already in use'
                });
            }
            res.status(500).json({
                status: 500,
                data: {},
                error: error.message,
                message: 'Internal Server Error'
            });
        }
    },
    /**
     * @filename urlShortener.js
     * @method POST
     * @router /api/:alias
     * @auther Abhijit swain
     * @description get url.
    */
    redirectShortUrl : async (req, res) => {
        try {
            const { alias } = req.params;
            console.log("-<<",alias);
            const cachedLongUrl = await redisClient.get(alias);
            if (cachedLongUrl) {
                console.log("cachedLongUrl:",cachedLongUrl);
                return res.redirect(cachedLongUrl); // Return the cached URL
            }
            // Find the URL by alias
            const urlEntry = await Url.findOne({ $or: [{ shortUrl: alias }, { customAlias: alias }] });

            if (!urlEntry) {
                return res.status(404).json({
                    status: 404,
                    data: {},
                    error: 'Short URL not found',
                    message:'Short URL not found' 
                    });
            }

            // Log analytics for the redirect
            await logRedirectEvent(req, urlEntry._id);

            // Cache the long URL in Redis for future use
            await redisClient.setEx(alias, 3600, urlEntry.longUrl); 
            // Redirect to the original URL
            res.redirect(urlEntry.longUrl);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 500,
                data: {},
                error: error.message,
                message: 'Internal Server Error'
             });
        }
    },


}    
