import dns from 'node:dns';
// Only use custom public DNS resolvers on Windows local development
// Cloud/serverless environments (Vercel, AWS Lambda, Linux) must use system host DNS
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialPortfolioData } from './src/services/initialData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shadowfighterzaid143_db_user:JHmvSKNimhaAfuqQ@cluster0.5rcip6z.mongodb.net/portfolio_db?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure MongoDB connection for incoming API requests
app.use(async (req, res, next) => {
  if (req.url.startsWith('/api') || req.path.startsWith('/api')) {
    try {
      await connectDB();
    } catch (e) {
      console.error('Database connection middleware error:', e.message);
    }
  }
  next();
});

// Mongoose Schemas & Models
const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  designation: { type: String, default: '' },
  tagline: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  statusBadge: { type: String, default: '' },
  email: { type: String, default: '' },
  contactRecipientEmail: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  location: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  instagram: { type: String, default: '' },
  twitter: { type: String, default: '' },
  typingPhrases: [{ type: String }],
  bio: { type: String, default: '' },
  careerGoals: { type: String, default: '' }
}, { timestamps: true });

const SkillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: Number, default: 85 }
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Full Stack' },
  date: { type: String, default: '2024' },
  imageUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  liveDemoUrl: { type: String, default: '' },
  technologies: [{ type: String }]
}, { timestamps: true });

const CertificateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String, default: '' },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

const EducationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  educationType: { type: String, default: 'college' }, // 'college' | 'school'
  institution: { type: String, required: true },
  degree: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: String, default: '' },
  duration: { type: String, default: '' },
  cgpa: { type: String, default: '' },
  board: { type: String, default: '' },
  standard: { type: String, default: '' },
  percentage: { type: String, default: '' },
  score: { type: String, default: '' },
  achievements: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true, strict: false });

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const Profile = mongoose.model('Profile', ProfileSchema);
const Skill = mongoose.model('Skill', SkillSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Certificate = mongoose.model('Certificate', CertificateSchema);
const Education = mongoose.model('Education', EducationSchema);
const Message = mongoose.model('Message', MessageSchema);

// Auto-seeder helper if database is initially empty
async function autoSeedIfEmpty() {
  try {
    const profileCount = await Profile.countDocuments();
    if (profileCount === 0) {
      console.log('🌱 Seeding initial portfolio profile to MongoDB Atlas...');
      await Profile.create(initialPortfolioData.profile);
    }

    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      console.log('🌱 Seeding 10 skill categories to MongoDB Atlas...');
      await Skill.insertMany(initialPortfolioData.skills);
    }

    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('🌱 Seeding initial projects to MongoDB Atlas...');
      await Project.insertMany(initialPortfolioData.projects);
    }

    const certCount = await Certificate.countDocuments();
    if (certCount === 0) {
      console.log('🌱 Seeding certificates to MongoDB Atlas...');
      await Certificate.insertMany(initialPortfolioData.certificates);
    }

    const eduCount = await Education.countDocuments();
    if (eduCount === 0) {
      console.log('🌱 Seeding education items to MongoDB Atlas...');
      await Education.insertMany(initialPortfolioData.education);
    }
  } catch (err) {
    console.error('Error during auto-seed check:', err);
  }
}

// REST API Endpoints

// 1. Health check
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'connected' : 'disconnected',
    database: mongoose.connection.name || 'portfolio_db',
    host: mongoose.connection.host || 'cluster0.5rcip6z.mongodb.net'
  });
});

// 2. Fetch all portfolio data (with Vercel Edge CDN Caching for sub-second speeds)
app.get(['/api/portfolio', '/portfolio'], async (req, res) => {
  try {
    // If request asks for fresh data (Admin or after update), bypass CDN cache
    if (req.query.fresh === '1' || req.query.admin === '1') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      // Edge CDN caches for 30s, background revalidates for 300s (sub-50ms responses for visitors!)
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    }

    let profile = await Profile.findOne().lean();
    if (!profile) {
      profile = await Profile.create(initialPortfolioData.profile);
    }

    const [skills, projects, certificates, education, messages] = await Promise.all([
      Skill.find().sort({ createdAt: 1 }).lean(),
      Project.find().sort({ createdAt: -1 }).lean(),
      Certificate.find().sort({ createdAt: -1 }).lean(),
      Education.find().sort({ createdAt: 1 }).lean(),
      Message.find().sort({ createdAt: -1 }).lean()
    ]);

    res.json({
      profile,
      skills: skills.length > 0 ? skills : initialPortfolioData.skills,
      projects: projects.length > 0 ? projects : initialPortfolioData.projects,
      certificates: certificates.length > 0 ? certificates : initialPortfolioData.certificates,
      education: education.length > 0 ? education : initialPortfolioData.education,
      messages: messages || []
    });
  } catch (err) {
    console.error('Error in GET /api/portfolio:', err);
    res.status(500).json({ error: err.message, fallback: initialPortfolioData });
  }
});

// 3. Update Profile (Supports both POST & PUT)
const handleProfileUpdate = async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });
    res.setHeader('Cache-Control', 'no-store');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.post(['/api/portfolio/profile', '/portfolio/profile'], handleProfileUpdate);
app.put(['/api/portfolio/profile', '/portfolio/profile'], handleProfileUpdate);

// 4. Skills CRUD
app.post('/api/portfolio/skills', async (req, res) => {
  try {
    const id = req.body.id || `skill-${Date.now()}`;
    const skill = await Skill.create({ ...req.body, id });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/portfolio/skills/:id', async (req, res) => {
  try {
    const updated = await Skill.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/portfolio/skills/:id', async (req, res) => {
  try {
    await Skill.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Projects CRUD
app.post('/api/portfolio/projects', async (req, res) => {
  try {
    const id = req.body.id || `proj-${Date.now()}`;
    const project = await Project.create({ ...req.body, id });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/portfolio/projects/:id', async (req, res) => {
  try {
    const updated = await Project.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/portfolio/projects/:id', async (req, res) => {
  try {
    await Project.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Certificates CRUD
app.post('/api/portfolio/certificates', async (req, res) => {
  try {
    const id = req.body.id || `cert-${Date.now()}`;
    const cert = await Certificate.create({ ...req.body, id });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/portfolio/certificates/:id', async (req, res) => {
  try {
    const updated = await Certificate.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/portfolio/certificates/:id', async (req, res) => {
  try {
    await Certificate.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Education CRUD
app.post('/api/portfolio/education', async (req, res) => {
  try {
    const id = req.body.id || `edu-${Date.now()}`;
    const edu = await Education.create({ ...req.body, id });
    res.json(edu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/portfolio/education/:id', async (req, res) => {
  try {
    const updated = await Education.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/portfolio/education/:id', async (req, res) => {
  try {
    await Education.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Contact Messages
app.post('/api/portfolio/messages', async (req, res) => {
  try {
    const id = req.body.id || `msg-${Date.now()}`;
    const message = await Message.create({
      ...req.body,
      id,
      createdAt: req.body.createdAt || new Date().toISOString()
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/portfolio/messages/:id', async (req, res) => {
  try {
    const updated = await Message.findOneAndUpdate(
      { id: req.params.id },
      { read: req.body.read },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/portfolio/messages/:id', async (req, res) => {
  try {
    await Message.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Portfolio Sync & Seed Endpoint (Full cloud database synchronization)
const handlePortfolioSync = async (req, res) => {
  try {
    const data = req.body && Object.keys(req.body).length > 0 ? req.body : initialPortfolioData;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    let updatedProfile = null;
    if (data.profile) {
      updatedProfile = await Profile.findOneAndUpdate({}, data.profile, { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true 
      });
    }

    if (Array.isArray(data.skills) && data.skills.length > 0) {
      for (const s of data.skills) {
        if (s.id) {
          await Skill.findOneAndUpdate({ id: s.id }, s, { upsert: true });
        }
      }
    }

    if (Array.isArray(data.projects) && data.projects.length > 0) {
      for (const p of data.projects) {
        if (p.id) {
          await Project.findOneAndUpdate({ id: p.id }, p, { upsert: true });
        }
      }
    }

    if (Array.isArray(data.certificates) && data.certificates.length > 0) {
      for (const c of data.certificates) {
        if (c.id) {
          await Certificate.findOneAndUpdate({ id: c.id }, c, { upsert: true });
        }
      }
    }

    if (Array.isArray(data.education) && data.education.length > 0) {
      for (const e of data.education) {
        if (e.id) {
          await Education.findOneAndUpdate({ id: e.id }, e, { upsert: true });
        }
      }
    }

    res.json({ 
      success: true, 
      message: 'Portfolio synced to MongoDB Atlas successfully!',
      profile: updatedProfile 
    });
  } catch (err) {
    console.error('Error syncing portfolio to MongoDB Atlas:', err);
    res.status(500).json({ error: err.message });
  }
};

app.post(['/api/portfolio/sync', '/portfolio/sync'], handlePortfolioSync);
app.post(['/api/portfolio/seed', '/portfolio/seed'], handlePortfolioSync);

// Direct API root endpoint
app.get(['/api', '/api/'], (req, res) => {
  res.json({
    status: 'online',
    message: 'Portfolio MongoDB API running on Vercel Serverless',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting'
  });
});

// Serve static files in production (Render, Docker, or unified hosting)
if (!process.env.VERCEL) {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  // Catch-all route for Single Page Application (SPA) routing
  app.get('{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// Database connection helper for standalone and serverless runtimes
let isConnected = false;
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  await mongoose.connect(MONGODB_URI, { 
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000 
  });
  if (!isConnected) {
    isConnected = true;
    autoSeedIfEmpty().catch(err => console.error('Seed error:', err.message));
  }
}

// Connect to MongoDB Atlas and Start Standalone Server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas cluster0.5rcip6z.mongodb.net successfully!');
      app.listen(PORT, () => {
        console.log(`🚀 Portfolio MongoDB API server running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
      // Start server anyway with fallback
      app.listen(PORT, () => {
        console.log(`⚠️ Portfolio API server running in fallback mode on port ${PORT}`);
      });
    });
}

export { app };
export default app;
