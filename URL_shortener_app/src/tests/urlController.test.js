// tests/urlController.test.js

const request = require('supertest');
const express = require('express');
const { createShortUrl, redirectShortUrl } = require('../controllers/url/urlShortener');
const redisClient = require('../config/redisClient');
const Url = require('../models/urlModel');

// Mock dependencies
jest.mock('../config/redisClient');
jest.mock('../models/urlModel');
// jest.mock('../services/urlService', () => ({
//     generateShortUrl: jest.fn(() => 'short-alias'),
// }));
// jest.mock('../services/logService', () => ({
//     logRedirectEvent: jest.fn(),
// }));

const app = express();
app.use(express.json());
app.post('/create', createShortUrl);
app.get('/:alias', redirectShortUrl);

describe('URL Controller - createShortUrl', () => {
    it('should create a short URL and return it successfully', async () => {
        const mockUrl = {
            longUrl: 'http://longurl.com',
            customAlias: 'short-alias',
            topic: 'general',
        };

        const mockUser = { id: 1 }; // Simulate logged-in user

        // Mock the database save
        Url.create.mockResolvedValue({
            longUrl: mockUrl.longUrl,
            shortUrl: `http://localhost:8000/${mockUrl.customAlias}`,
            customAlias: mockUrl.customAlias,
            topic: mockUrl.topic,
            userId: mockUser.id,
            createdAt: new Date(),
        });

        const response = await request(app)
            .post('/create')
            .set('Authorization', `Bearer fake-token`) // Assuming user is authenticated
            .send(mockUrl);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('URL shortened successfully');
        expect(response.body.data.shortUrl).toBe('http://localhost:8000/short-alias');
    });

    it('should return an error if longUrl is not provided', async () => {
        const response = await request(app).post('/create').send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('longUrl is required');
    });

    it('should return a conflict error if custom alias is already in use', async () => {
        const mockUrl = {
            longUrl: 'http://longurl.com',
            customAlias: 'short-alias',
        };

        Url.create.mockRejectedValueOnce(new Error('Custom alias already in use'));

        const response = await request(app)
            .post('/create')
            .send(mockUrl);

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('Custom alias already in use');
    });
});

describe('URL Controller - redirectShortUrl', () => {
    it('should redirect to the long URL from cache if available', async () => {
        const alias = 'short-alias';
        const cachedLongUrl = 'http://longurl.com';

        redisClient.get.mockResolvedValue(cachedLongUrl);

        const response = await request(app).get(`/${alias}`);

        expect(response.status).toBe(302);
        expect(response.header.location).toBe(cachedLongUrl);
    });

    it('should find the long URL by alias and redirect', async () => {
        const alias = 'short-alias';
        const mockUrlEntry = {
            longUrl: 'http://longurl.com',
            customAlias: alias,
        };

        redisClient.get.mockResolvedValue(null); // No cache

        Url.findOne.mockResolvedValue(mockUrlEntry);

        const response = await request(app).get(`/${alias}`);

        expect(response.status).toBe(302);
        expect(response.header.location).toBe(mockUrlEntry.longUrl);
    });

    it('should return 404 if short URL is not found', async () => {
        const alias = 'nonexistent-alias';

        redisClient.get.mockResolvedValue(null);

        Url.findOne.mockResolvedValue(null);

        const response = await request(app).get(`/${alias}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Short URL not found');
    });
});
