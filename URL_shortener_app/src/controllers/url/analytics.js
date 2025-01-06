const Url = require('../../models/urlModel');
const Analytics = require('../../models/analytics');
const moment = require('moment');
const redisClient = require('../../config/redisClient');

module.exports = {

    // GET /api/analytics/:alias
    getUrlAnalytics: async (req, res) => {
        try {
            const { alias } = req.params;

            // Find the URL entry by alias
            const urlEntry = await Url.findOne({ $or: [{ shortUrl: alias }, { customAlias: alias }] });
            if (!urlEntry) {
                return res.status(404).json({
                    status:404,
                    data:{},
                    error: 'Short URL not found', 
                    message: 'Short URL not found',
                });
            }

            const urlId = urlEntry._id;
            console.log(urlId);
            const cacheId = urlId.toString();
            const cachedLongUrl = await redisClient.get(cacheId);
            if(cachedLongUrl){
                return res.status(200).json({
                    status: 200,
                    data: JSON.parse(cachedLongUrl),
                    error: {},
                    message: 'Analytics data retrieved successfully.'
                });
            }

            const analyticsData = await Analytics.find({ urlId });

            // Aggregate total clicks and unique users
            const totalClicks = analyticsData.length;
            const uniqueUsers = new Set(analyticsData.map((data) => data.ipAddress)).size;

            // Aggregate clicks by date for the last 7 days
            const clicksByDate = Array.from({ length: 7 }, (_, i) => {
                const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
                const dailyClicks = analyticsData.filter((data) =>
                    moment(data.timestamp).isSame(date, 'day')
                ).length;
                return { date, clicks: dailyClicks };
            }).reverse();

            // Aggregate clicks by OS
            const osType = analyticsData.reduce((acc, curr) => {
                const osName = curr.userAgent.split('(')[1]?.split(';')[0]?.trim() || 'Unknown';
                if (!acc[osName]) acc[osName] = { osName, uniqueClicks: 0, uniqueUsers: new Set() };
                acc[osName].uniqueClicks += 1;
                acc[osName].uniqueUsers.add(curr.ipAddress);
                return acc;
            }, {});

            const osTypeArray = Object.values(osType).map((os) => ({
                osName: os.osName,
                uniqueClicks: os.uniqueClicks,
                uniqueUsers: os.uniqueUsers.size,
            }));

            // Aggregate clicks by device type
            const deviceType = analyticsData.reduce((acc, curr) => {
                const deviceName = curr.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
                if (!acc[deviceName]) acc[deviceName] = { deviceName, uniqueClicks: 0, uniqueUsers: new Set() };
                acc[deviceName].uniqueClicks += 1;
                acc[deviceName].uniqueUsers.add(curr.ipAddress);
                return acc;
            }, {});

            const deviceTypeArray = Object.values(deviceType).map((device) => ({
                deviceName: device.deviceName,
                uniqueClicks: device.uniqueClicks,
                uniqueUsers: device.uniqueUsers.size,
            }));

            // Response object
            const response = {
                totalClicks,
                uniqueUsers,
                clicksByDate,
                osType: osTypeArray,
                deviceType: deviceTypeArray,
            };
            // Cache the long URL in Redis for future use
            await redisClient.setEx(cacheId, 3600, JSON.stringify(response));
            return res.status(200).json({
                status: 200,
                data: response,
                error: {},
                message: 'Analytics data retrieved successfully.'
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 500,
                data: {},
                error: error.message,
                message: 'Internal Server Error'
            });
        }
    },
    // GET /api/analytics/topic/:topic
    getTopicAnalytics: async (req, res) => {
        try {
            const { topic } = req.params;

            // Fetch all URLs under the specified topic
            const urls = await Url.find({ topic });
            if (!urls.length) {
                return res.status(404).json({
                    status: 400,
                    data: {},
                    error: 'No URLs found for this topic',
                    message: 'No URLs found for the specified topic',
                });
            }
            const cachedAnalytics = await redisClient.get(topic);
            if (cachedAnalytics) {
                return res.status(200).json({
                    status: 200,
                    data: JSON.parse(cachedAnalytics),
                    error: {},
                    message: 'Analytics data retrieved successfully',
                })
            }

            // Initialize response data
            let totalClicks = 0;
            let uniqueUserSet = new Set();
            const clicksByDateMap = {};
            const urlsAnalytics = [];

            for (const url of urls) {
                const urlId = url._id;

                // Fetch analytics data for the current URL
                const analyticsData = await Analytics.find({ urlId });

                // Calculate total clicks and unique users for the URL
                const urlTotalClicks = analyticsData.length;
                const urlUniqueUsers = new Set(analyticsData.map((data) => data.ipAddress)).size;

                // Aggregate total clicks and unique users for the topic
                totalClicks += urlTotalClicks;
                analyticsData.forEach((data) => uniqueUserSet.add(data.ipAddress));

                // Aggregate clicks by date
                analyticsData.forEach((data) => {
                    const date = moment(data.timestamp).format('YYYY-MM-DD');
                    clicksByDateMap[date] = (clicksByDateMap[date] || 0) + 1;
                });

                // Add URL-level analytics to the response
                urlsAnalytics.push({
                    shortUrl: url.shortUrl,
                    totalClicks: urlTotalClicks,
                    uniqueUsers: urlUniqueUsers,
                });
            }

            // Format clicks by date for the last 7 days
            const clicksByDate = Array.from({ length: 7 }, (_, i) => {
                const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
                return { date, clicks: clicksByDateMap[date] || 0 };
            }).reverse();

            // Prepare final response
            const response = {
                totalClicks,
                uniqueUsers: uniqueUserSet.size,
                clicksByDate,
                urls: urlsAnalytics,
            };
            await redisClient.setEx(topic, 1200, JSON.stringify(response));

            return res.status(200).json({
                status: 200,
                data: response,
                error: {},
                message: 'Analytics data retrieved successfully',
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 500,
                data: {},
                error: error.message,
                message: 'Internal Server Error'
            });
        }
    },
    // GET /api/analytics/overall
    getOverallAnalytics : async (req, res) => {
        try {
            const userId = req.user.id; // Assume authenticated user's ID is in req.user

            // Fetch all URLs created by the user
            const userUrls = await Url.find({ userId: userId });

            if (!userUrls.length) {
                return res.status(404).json({ 
                    status: 404,
                    data: {},
                    error:'No URLs found for this user.',
                    message: 'No URLs found for this user.' 
                });
            }
            const cachedAnalytics = await redisClient.get(userId);
            if(cachedAnalytics){
                return res.status(200).json({
                    status: 200,
                    data: JSON.parse(cachedAnalytics),
                    error: {},
                    message: 'Analytics data retrieved successfully.'
                });
            }
            
            // Initialize analytics response
            let totalClicks = 0;
            let uniqueUserSet = new Set();
            const clicksByDateMap = {};
            const osTypeMap = {};
            const deviceTypeMap = {};

            for (const url of userUrls) {
                const urlId = url._id;

                // Fetch analytics data for the current URL
                const analyticsData = await Analytics.find({ urlId });

                // Aggregate total clicks and unique users
                totalClicks += analyticsData.length;
                analyticsData.forEach((data) => uniqueUserSet.add(data.ipAddress));

                // Aggregate clicks by date
                analyticsData.forEach((data) => {
                    const date = moment(data.timestamp).format('YYYY-MM-DD');
                    clicksByDateMap[date] = (clicksByDateMap[date] || 0) + 1;
                });

                // Aggregate OS type data
                analyticsData.forEach((data) => {
                    const osName = data.os || 'Unknown';
                    if (!osTypeMap[osName]) {
                        osTypeMap[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
                    }
                    osTypeMap[osName].uniqueClicks++;
                    osTypeMap[osName].uniqueUsers.add(data.ipAddress);
                });

                // Aggregate device type data
                analyticsData.forEach((data) => {
                    const deviceName = data.deviceType || 'Unknown';
                    if (!deviceTypeMap[deviceName]) {
                        deviceTypeMap[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
                    }
                    deviceTypeMap[deviceName].uniqueClicks++;
                    deviceTypeMap[deviceName].uniqueUsers.add(data.ipAddress);
                });
            }

            // Format response data
            const clicksByDate = Array.from({ length: 7 }, (_, i) => {
                const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
                return { date, clicks: clicksByDateMap[date] || 0 };
            }).reverse();

            const osType = Object.keys(osTypeMap).map((osName) => ({
                osName,
                uniqueClicks: osTypeMap[osName].uniqueClicks,
                uniqueUsers: osTypeMap[osName].uniqueUsers.size,
            }));

            const deviceType = Object.keys(deviceTypeMap).map((deviceName) => ({
                deviceName,
                uniqueClicks: deviceTypeMap[deviceName].uniqueClicks,
                uniqueUsers: deviceTypeMap[deviceName].uniqueUsers.size,
            }));

            // Final response
            const response = {
                totalUrls: userUrls.length,
                totalClicks,
                uniqueUsers: uniqueUserSet.size,
                clicksByDate,
                osType,
                deviceType,
            };
            await redisClient.setEx(userId, 1200, JSON.stringify(response));
            return res.status(200).json({
                status: 200,
                data: response,
                error: {},
                message: 'Analytics data retrieved successfully',
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 500,
                data: {},
                error: error.message,
                message: 'Internal Server Error'
            });        
        }
    }
}

