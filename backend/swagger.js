const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Expenses Management API',
      version: '1.0.0',
      description: 'API documentation for Expenses Management project',
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
    components: {
      schemas: {
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            user: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number' },
            category: { type: 'string' },
            type: { type: 'string', enum: ['expense', 'income'] },
            date: { type: 'string', format: 'date-time' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Đường dẫn tới file có comment swagger
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
