import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Backend club IA API",
      version: "1.0.0",
      description: "Documentation of backend club IA API",
      contact: {
        email: "sogancarmen1@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
  },
  apis: [
    "./src/articles/*.ts",
    "./src/authentification/*.ts",
    "./src/email/*.ts",
    "./src/newsletters/*.ts",
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerDocs };
