import { initialPortfolioData } from './initialData';
import { cloudinaryService } from './cloudinaryService';

const LOCAL_STORAGE_KEY = 'portfolio_data_v1';

// Helper to initialize or get local storage data
const getLocalData = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error reading from localStorage', err);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialPortfolioData));
  return initialPortfolioData;
};

// Helper to save to local storage and trigger UI updates
const saveLocalData = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('portfolio-data-updated'));
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
};

export const portfolioService = {
  // Test MongoDB connection via /api/health
  async testMongoConnection() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return {
          success: data.status === 'connected',
          database: data.database || 'portfolio_db',
          host: data.host || 'cluster0.5rcip6z.mongodb.net',
          message: data.status === 'connected'
            ? `Connected to MongoDB Atlas (${data.host || 'Cluster0'}) database "${data.database}"!`
            : 'Connecting to MongoDB Atlas...'
        };
      }
      throw new Error(`Server returned status ${res.status}`);
    } catch (err) {
      return {
        success: false,
        code: 'API_OFFLINE',
        message: 'MongoDB API backend is initializing or unreachable. Local storage active.',
        error: err.message
      };
    }
  },

  // Test Cloudinary connection
  async testCloudinaryConnection() {
    return await cloudinaryService.testConnection();
  },

  // Direct Image File Upload via Cloudinary with smart fallback
  async uploadImage(file, folder = 'portfolio/projects') {
    return await cloudinaryService.uploadImage(file, folder);
  },

  // Fetch all portfolio data from MongoDB Atlas (with instant local storage fallback)
  async getAllData() {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          saveLocalData(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend /api/portfolio not reached, using persistent local storage:', err.message);
    }
    return getLocalData();
  },

  // Update Profile
  async updateProfile(profileData) {
    const current = getLocalData();
    current.profile = { ...current.profile, ...profileData };
    saveLocalData(current);

    try {
      await fetch('/api/portfolio/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
    } catch (err) {
      console.warn('Could not sync profile to MongoDB API:', err.message);
    }

    return current.profile;
  },

  // Skills CRUD
  async addSkill(skillItem) {
    const current = getLocalData();
    const newItem = { id: `skill-${Date.now()}`, ...skillItem };
    current.skills = [...(current.skills || []), newItem];
    saveLocalData(current);

    try {
      await fetch('/api/portfolio/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (err) {
      console.warn('Could not sync skill to MongoDB API:', err.message);
    }

    return newItem;
  },

  async updateSkill(id, skillItem) {
    const current = getLocalData();
    current.skills = (current.skills || []).map(item => item.id === id ? { ...item, ...skillItem } : item);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/skills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillItem)
      });
    } catch (err) {
      console.warn('Could not update skill on MongoDB API:', err.message);
    }

    return { id, ...skillItem };
  },

  async deleteSkill(id) {
    const current = getLocalData();
    current.skills = (current.skills || []).filter(item => item.id !== id);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/skills/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete skill on MongoDB API:', err.message);
    }

    return true;
  },

  // Projects CRUD
  async addProject(projectItem) {
    const current = getLocalData();
    const newItem = { id: `proj-${Date.now()}`, ...projectItem };
    current.projects = [newItem, ...(current.projects || [])];
    saveLocalData(current);

    try {
      await fetch('/api/portfolio/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (err) {
      console.warn('Could not sync project to MongoDB API:', err.message);
    }

    return newItem;
  },

  async updateProject(id, projectItem) {
    const current = getLocalData();
    current.projects = (current.projects || []).map(item => item.id === id ? { ...item, ...projectItem } : item);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectItem)
      });
    } catch (err) {
      console.warn('Could not update project on MongoDB API:', err.message);
    }

    return { id, ...projectItem };
  },

  async deleteProject(id) {
    const current = getLocalData();
    current.projects = (current.projects || []).filter(item => item.id !== id);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/projects/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete project on MongoDB API:', err.message);
    }

    return true;
  },

  // Certificates CRUD
  async addCertificate(certItem) {
    const current = getLocalData();
    const newItem = { id: `cert-${Date.now()}`, ...certItem };
    current.certificates = [newItem, ...(current.certificates || [])];
    saveLocalData(current);

    try {
      await fetch('/api/portfolio/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (err) {
      console.warn('Could not sync certificate to MongoDB API:', err.message);
    }

    return newItem;
  },

  async updateCertificate(id, certItem) {
    const current = getLocalData();
    current.certificates = (current.certificates || []).map(item => item.id === id ? { ...item, ...certItem } : item);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certItem)
      });
    } catch (err) {
      console.warn('Could not update certificate on MongoDB API:', err.message);
    }

    return { id, ...certItem };
  },

  async deleteCertificate(id) {
    const current = getLocalData();
    current.certificates = (current.certificates || []).filter(item => item.id !== id);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/certificates/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete certificate on MongoDB API:', err.message);
    }

    return true;
  },

  // Education CRUD
  async addEducation(eduItem) {
    const current = getLocalData();
    const newItem = { id: `edu-${Date.now()}`, ...eduItem };
    current.education = [newItem, ...(current.education || [])];
    saveLocalData(current);

    try {
      await fetch('/api/portfolio/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (err) {
      console.warn('Could not sync education to MongoDB API:', err.message);
    }

    return newItem;
  },

  async updateEducation(id, eduItem) {
    const current = getLocalData();
    current.education = (current.education || []).map(item => item.id === id ? { ...item, ...eduItem } : item);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/education/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eduItem)
      });
    } catch (err) {
      console.warn('Could not update education on MongoDB API:', err.message);
    }

    return { id, ...eduItem };
  },

  async deleteEducation(id) {
    const current = getLocalData();
    current.education = (current.education || []).filter(item => item.id !== id);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/education/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete education on MongoDB API:', err.message);
    }

    return true;
  },

  // Contact Messages with Direct Email Dispatch to configured Admin email
  async sendMessage(messageData, recipientEmail) {
    const msg = {
      ...messageData,
      createdAt: new Date().toISOString(),
      read: false
    };

    // 1. Direct Email Dispatch using FormSubmit AJAX
    const targetEmail = recipientEmail || 'admin@portfolio.com';
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: messageData.name,
          email: messageData.email,
          subject: messageData.subject || 'New Portfolio Contact Form Message',
          message: messageData.message,
          _subject: `[Portfolio Inquiry] ${messageData.subject || messageData.name}`
        })
      });
      console.log('✉️ Direct email dispatched via FormSubmit to:', targetEmail);
    } catch (fErr) {
      console.warn('FormSubmit direct email dispatch note:', fErr);
    }

    // 2. Persist message locally and in MongoDB
    const current = getLocalData();
    const newMsg = { id: `msg-${Date.now()}`, ...msg };
    current.messages = [newMsg, ...(current.messages || [])];
    saveLocalData(current);

    try {
      await fetch('/api/portfolio/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch (err) {
      console.warn('Could not save message to MongoDB API:', err.message);
    }

    return newMsg;
  },

  async markMessageRead(id, readState = true) {
    const current = getLocalData();
    current.messages = (current.messages || []).map(m => m.id === id ? { ...m, read: readState } : m);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: readState })
      });
    } catch (err) {
      console.warn('Could not update message read state on MongoDB API:', err.message);
    }

    return true;
  },

  async deleteMessage(id) {
    const current = getLocalData();
    current.messages = (current.messages || []).filter(m => m.id !== id);
    saveLocalData(current);

    try {
      await fetch(`/api/portfolio/messages/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete message on MongoDB API:', err.message);
    }

    return true;
  },

  // Restore factory seed data
  resetToDefaults() {
    saveLocalData(initialPortfolioData);
    return initialPortfolioData;
  },

  // Export all portfolio data to a JSON string for easy download/backup
  exportDataAsJson() {
    const data = getLocalData();
    return JSON.stringify(data, null, 2);
  },

  // Import portfolio data from a JSON string
  importDataFromJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        saveLocalData(parsed);
        return { success: true, data: parsed };
      }
      throw new Error('Invalid JSON format');
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Seed current portfolio data into MongoDB Atlas
  async seedMongoAtlas() {
    const current = getLocalData();
    const res = await fetch('/api/portfolio/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(current)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to seed data to MongoDB Atlas');
    }

    return await res.json();
  }
};
