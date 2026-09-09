import app, { connectDB } from '../server.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB serverless connection error:', err);
  }
  return app(req, res);
}
