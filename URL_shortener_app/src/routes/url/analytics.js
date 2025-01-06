const express = require('express');
const analyticsRouter = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const analytics = require('../../controllers/url/analytics');

analyticsRouter.get('/overall',authMiddleware(),analytics.getOverallAnalytics);
analyticsRouter.get('/:alias',authMiddleware(),analytics.getUrlAnalytics);
analyticsRouter.get('/topic/:topic',authMiddleware(),analytics.getTopicAnalytics);
/**
 * @swagger
 * /api/analytics/{alias}:
 *   get:
 *     summary: Get analytics for a short url
 *     tags: [Short URLs]
 *     components:
 *        securitySchemes:
 *           ApiKeyAuth:
 *              type: apiKey
 *              in: header   
 *              name: Authorization
 *              description: Your custom Authorization token.
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string           
 *           description: Enter alias for short url
 *     responses:
 *       200:
 *         description: Analytics data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                      type: integer
 *                 data:
 *                   type: object
 *                   description: shortUrl and createdAt
 *                 error:
 *                   type: string
 *                   description: errors
 *                 message:
 *                   type: string
 *                   description: URL shortened successfully
 *                        
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 404 respnse code
 *                 data:
 *                   type: object
 *                   description: {Empty}
 *                 error:
 *                   type: string
 *                   description: Short URL not found
 *                 message:
 *                   type: string
 *                   description: Short URL not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 500 respnse code
 *                 data:
 *                   type: object
 *                   description: {Empty}
 *                 error:
 *                   type: string
 *                   description: Internal Server Error
 *                 message:
 *                   type: string
 *                   description: Internal Server Error
 * 
 * /api/analytics/topic/{topic}:
 *   get:
 *     summary: Get Analytics with topic
 *     description: get analytics following topic.
 *     tags: [Short URLs]
 *     components:
 *        securitySchemes:
 *           ApiKeyAuth:
 *              type: apiKey
 *              in: header   
 *              name: Authorization
 *              description: Your custom Authorization token.
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string           
 *           description: Enter topic for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                      type: integer
 *                 data:
 *                   type: object
 *                 error:
 *                   type: string
 *                   description: errors
 *                 message:
 *                   type: string
 *                   description: Analytics data retrieved successfully
 *              
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 404 respnse code
 *                 data:
 *                   type: object
 *                   description: {Empty}
 *                 error:
 *                   type: string
 *                   description: No URLs found for the specified topic
 *                 message:
 *                   type: string
 *                   description: No URLs found for the specified topic
 *       
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 500 respnse code
 *                 data:
 *                   type: object
 *                   description: {Empty}
 *                 error:
 *                   type: string
 *                   description: 'Internal Server Error'
 *                 message:
 *                   type: string
 *                   description: 'Internal Server Error'
 * /api/analytics/overall:
 *   get:
 *     summary: Get Overall Analytics.
 *     description: get over all analytics.
 *     tags: [Short URLs]
 *     components:
 *        securitySchemes:
 *           ApiKeyAuth:
 *              type: apiKey
 *              in: header   
 *              name: Authorization
 *              description: Your custom Authorization token.
 *     responses:
 *       200:
 *         description: Analytics data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                      type: integer
 *                 data:
 *                   type: object
 *                 error:
 *                   type: string
 *                   description: errors
 *                 message:
 *                   type: string
 *                   description: Analytics data retrieved successfully
 *              
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 404 respnse code
 *                 data:
 *                   type: object
 *                   description: {Empty}
 *                 error:
 *                   type: string
 *                   description: No URLs found for this user.
 *                 message:
 *                   type: string
 *                   description: No URLs found for this user.
 *       
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 500 respnse code
 *                 data:
 *                   type: object
 *                   description: {Empty}
 *                 error:
 *                   type: string
 *                   description: 'Internal Server Error'
 *                 message:
 *                   type: string
 *                   description: 'Internal Server Error'
 * 
 */


module.exports = analyticsRouter;