import app, { connectDB } from '../server.js';

export default async function handler(req, res) {
  // Ensure req.url starts with /api for express routing
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error in serverless:', err.message);
  }
  return app(req, res);
}
