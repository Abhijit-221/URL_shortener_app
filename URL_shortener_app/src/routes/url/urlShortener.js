const express = require('express');
const urlShortener = require('../../controllers/url/urlShortener');
const urlRouter = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const { createShortUrlLimiter } = require('../../middlewares/ratelimiters');
urlRouter.post('/shorten',authMiddleware(),createShortUrlLimiter,urlShortener.createShortUrl);

urlRouter.get('/:alias',authMiddleware(),urlShortener.redirectShortUrl);


/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a new short URL
 *     tags: [Short URLs]
 *     components:
 *        securitySchemes:
 *           ApiKeyAuth:
 *              type: apiKey
 *              in: header   
 *              name: Authorization
 *              description: Your custom Authorization token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: Original URL to be shortened
 *               customAlias:
 *                 type: string
 *                 description: Custom alias for the short URL
 *               topic:
 *                 type: string
 *                 description: Custom alias for the short URL
 *     responses:
 *       201:
 *         description: Short URL created successfully
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
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 400 respnse code
 *                 data:
 *                   type: object
 *                   description: {Empty}
 *                 error:
 *                   type: string
 *                   description: longUrl is required
 *                 message:
 *                   type: string
 *                   description: longUrl is required
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: 409 respnse code
 *                 data:
 *                   type: object
 *                   description: {Empty}
 *                 error:
 *                   type: string
 *                   description: Custom alias already in use
 *                 message:
 *                   type: string
 *                   description: Custom alias already in use
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
 * /api/{alias}:
 *   get:
 *     summary: redirect short url
 *     description: redirect to the original url from short url.
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
 *         description: redirect to original url
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
module.exports = urlRouter;