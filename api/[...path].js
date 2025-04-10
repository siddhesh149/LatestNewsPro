// API catch-all handler for Vercel
import express from 'express';
import { registerRoutes } from '../server/routes';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let routesRegistered = false;

export default async function handler(req, res) {
  // Only register routes once
  if (!routesRegistered) {
    await registerRoutes(app);
    routesRegistered = true;
  }
  
  // Process the request with Express
  return app(req, res);
}