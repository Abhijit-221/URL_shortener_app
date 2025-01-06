const request = require('supertest');
const app = require('../app');  // Assuming your Express app is exported from app.js or server.js
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const Url = require('../models/urlModel');
const Analytics = require('../models/analytics');
const redisClient = require('../config/redisClient');  // Assuming Redis client is exported from this file

// Mocks
jest.mock('../models/urlModel');
jest.mock('../models/analytics');
jest.mock('../config/redisClient');

describe('Analytics API', () => {
  
  describe('GET /api/analytics/:alias', () => {
    it('should return analytics data for a short URL alias', async () => {
      const alias = 'short-alias';
      const mockAnalytics = [
        { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', timestamp: '2025-01-06T00:00:00Z' },
        { ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', timestamp: '2025-01-06T01:00:00Z' }
      ];

      Url.findOne.mockResolvedValue({ _id: '1', shortUrl: alias, customAlias: alias });
      Analytics.find.mockResolvedValue(mockAnalytics);
      redisClient.get.mockResolvedValue(null);  // Simulate cache miss

      const response = await request(app).get(`/api/analytics/${alias}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalClicks');
      expect(response.body.data).toHaveProperty('uniqueUsers');
      expect(response.body.data).toHaveProperty('clicksByDate');
      expect(response.body.data).toHaveProperty('osType');
      expect(response.body.data).toHaveProperty('deviceType');
    });

    it('should return 404 if short URL alias not found', async () => {
      const alias = 'nonexistent-alias';

      Url.findOne.mockResolvedValue(null);  // Simulate URL not found

      const response = await request(app).get(`/api/analytics/${alias}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(404);
      expect(response.body.message).toBe('Short URL not found');
    });
  });

  describe('GET /api/analytics/topic/:topic', () => {
    it('should return analytics data for a given topic', async () => {
      const topic = 'tech';
      const mockUrls = [{ _id: '1', shortUrl: 'http://short.url', topic }];
      const mockAnalytics = [
        { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', timestamp: '2025-01-06T00:00:00Z' }
      ];

      Url.find.mockResolvedValue(mockUrls);
      Analytics.find.mockResolvedValue(mockAnalytics);
      redisClient.get.mockResolvedValue(null);  // Simulate cache miss

      const response = await request(app).get(`/api/analytics/topic/${topic}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalClicks');
      expect(response.body.data).toHaveProperty('uniqueUsers');
      expect(response.body.data).toHaveProperty('clicksByDate');
      expect(response.body.data).toHaveProperty('urls');
    });

    it('should return 404 if no URLs found for the topic', async () => {
      const topic = 'nonexistent-topic';

      Url.find.mockResolvedValue([]);  // Simulate no URLs for this topic

      const response = await request(app).get(`/api/analytics/topic/${topic}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(404);
      expect(response.body.message).toBe('No URLs found for the specified topic');
    });
  });

  describe('GET /api/analytics/overall', () => {
    it('should return overall analytics data for the authenticated user', async () => {
      const mockUserId = 'user-123';
      const mockUrls = [{ _id: '1', userId: mockUserId, shortUrl: 'http://short.url' }];
      const mockAnalytics = [
        { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', timestamp: '2025-01-06T00:00:00Z' }
      ];

      // Simulate the authenticated user
      const mockReq = mockRequest({ user: { id: mockUserId } });

      Url.find.mockResolvedValue(mockUrls);
      Analytics.find.mockResolvedValue(mockAnalytics);
      redisClient.get.mockResolvedValue(null);  // Simulate cache miss

      const response = await request(app).get('/api/analytics/overall').set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalUrls');
      expect(response.body.data).toHaveProperty('totalClicks');
      expect(response.body.data).toHaveProperty('uniqueUsers');
      expect(response.body.data).toHaveProperty('clicksByDate');
      expect(response.body.data).toHaveProperty('osType');
      expect(response.body.data).toHaveProperty('deviceType');
    });

    it('should return 404 if no URLs found for the user', async () => {
      const mockUserId = 'user-123';

      const mockReq = mockRequest({ user: { id: mockUserId } });
      Url.find.mockResolvedValue([]);  // Simulate no URLs for the user

      const response = await request(app).get('/api/analytics/overall').set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(404);
      expect(response.body.message).toBe('No URLs found for this user.');
    });
  });

});
