const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'URL Shortener API',
            version: '1.0.0',
        },
        
        servers: [
            {
                url: 'http://localhost:8000', // Replace with your base URL
                description: 'local Server',
            },
        ],
        components: {
            securitySchemes: {
              ApiKeyAuth: {
                type: "apiKey",
                in: "header",
                name: "Authorization",
              },
            },
          },
        security: [
        {
            ApiKeyAuth: [],
        },
        ],
    },
    apis: ['./src/routes/url/*.js'], // Path to API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;