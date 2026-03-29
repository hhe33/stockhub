const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Multistore API",
      version: "1.0.0",
      description: "REST API for managing a multi-store inventory system with authentication, products, stores, inventory, sales, and transfers.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "64abc123def456" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Electronics" },
            description: { type: "string" },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64abc123def456" },
            name: { type: "string", example: "Laptop Pro" },
            sku: { type: "string", example: "LP-001" },
            price: { type: "number", example: 999.99 },
            category: { type: "string", example: "Electronics" },
          },
        },
        Store: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64abc123def456" },
            name: { type: "string", example: "Main Store" },
            location: { type: "string", example: "Paris" },
          },
        },
        Inventory: {
          type: "object",
          properties: {
            _id: { type: "string" },
            store: { $ref: "#/components/schemas/Store" },
            product: { $ref: "#/components/schemas/Product" },
            quantity: { type: "number", example: 50 },
            minStock: { type: "number", example: 10 },
          },
        },
        Sale: {
          type: "object",
          properties: {
            _id: { type: "string" },
            store: { $ref: "#/components/schemas/Store" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { $ref: "#/components/schemas/Product" },
                  quantity: { type: "number" },
                  unitPrice: { type: "number" },
                  subtotal: { type: "number" },
                },
              },
            },
            total: { type: "number", example: 1999.98 },
            date: { type: "string", format: "date-time" },
          },
        },
        Transfer: {
          type: "object",
          properties: {
            _id: { type: "string" },
            fromStore: { $ref: "#/components/schemas/Store" },
            toStore: { $ref: "#/components/schemas/Store" },
            product: { $ref: "#/components/schemas/Product" },
            quantity: { type: "number", example: 10 },
            date: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "An error occurred" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
