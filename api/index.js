// Serverless function entry point for Vercel
import express from 'express';
import { registerRoutes } from '../server/routes';
import path from 'path';
import fs from 'fs';

// Initialize Express app for serverless environment
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create serverless handler
export default async function handler(req, res) {
  // Set up Express routes
  await registerRoutes(app);
  
  // Handle static files in production
  if (req.url && !req.url.startsWith('/api/')) {
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    
    // Serve the SPA for all non-API routes
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html');
      res.send(fs.readFileSync(indexPath));
      return;
    }
  }
  
  // Let Express handle the request
  return app(req, res);
}