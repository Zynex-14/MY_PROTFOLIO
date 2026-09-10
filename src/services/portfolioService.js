import { initialPortfolioData } from './initialData';
import { cloudinaryService } from './cloudinaryService';

const LOCAL_STORAGE_KEY = 'portfolio_data_v1';

// Internal helper to get local storage data
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

// Internal helper to save to local storage and trigger UI re-renders
const saveLocalData = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('portfolio-data-updated'));
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
};

// Safe API requester handling JSON parsing and informative error bubbles
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    let errText = `Server returned status ${res.status}`;
    if (ct.includes('application/json')) {
      try {
        const json = await res.json();
        errText = json.error || errText;
      } catch (e) {}
    }
    throw new Error(errText);
  }
  if (ct.includes('application/json')) {
    return await res.json();
  }
  return { success: true };
}

export const portfolioService = {
  // Test MongoDB connection via /api/health
  async testMongoConnection() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          return {
            success: data.status === 'connected',
            database: data.database || 'portfolio_db',
            host: data.host || 'cluster0.5rcip6z.mongodb.net',
            message: data.status === 'connected'
              ? `Connected to MongoDB Atlas (${data.host || 'Cluster0'}) database "${data.database || 'portfolio_db'}"!`
              : 'Connecting to MongoDB Atlas...'
          };
        }
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

  // 1. Fetch all portfolio data (Edge-cached for visitors, fresh for Admin)
  async getAllData(options = {}) {
    try {
      const url = options.fresh ? `/api/portfolio?fresh=1&t=${Date.now()}` : '/api/portfolio';
      const res = await fetch(url);
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (data && data.profile) {
            saveLocalData(data);
            return data;
          }
        }
      }
    } catch (err) {
      console.warn('Backend /api/portfolio not reached, using local storage cache:', err.message);
    }
    return getLocalData();
  },

  // 2. Update Profile with verified cloud write
  async updateProfile(profileData) {
    const current = getLocalData();
    current.profile = { ...current.profile, ...profileData };

    await apiFetch('/api/portfolio/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });

    saveLocalData(current);
    return current.profile;
  },

  // 3. Skills CRUD
  async addSkill(skillItem) {
    const current = getLocalData();
    const newItem = { id: `skill-${Date.now()}`, ...skillItem };

    await apiFetch('/api/portfolio/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    current.skills = [...(current.skills || []), newItem];
    saveLocalData(current);
    return newItem;
  },

  async updateSkill(id, skillItem) {
    const current = getLocalData();

    await apiFetch(`/api/portfolio/skills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skillItem)
    });

    current.skills = (current.skills || []).map(item => item.id === id ? { ...item, ...skillItem } : item);
    saveLocalData(current);
    return { id, ...skillItem };
  },

  async deleteSkill(id) {
    const current = getLocalData();

    await apiFetch(`/api/portfolio/skills/${id}`, { method: 'DELETE' });

    current.skills = (current.skills || []).filter(item => item.id !== id);
    saveLocalData(current);
    return true;
  },

  // 4. Projects CRUD
  async addProject(projectItem) {
    const current = getLocalData();
    const newItem = { id: `proj-${Date.now()}`, ...projectItem };

    await apiFetch('/api/portfolio/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    current.projects = [newItem, ...(current.projects || [])];
    saveLocalData(current);
    return newItem;
  },

  async updateProject(id, projectItem) {
    const current = getLocalData();

    await apiFetch(`/api/portfolio/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectItem)
    });

    current.projects = (current.projects || []).map(item => item.id === id ? { ...item, ...projectItem } : item);
    saveLocalData(current);
    return { id, ...projectItem };
  },

  async deleteProject(id) {
    const current = getLocalData();

    await apiFetch(`/api/portfolio/projects/${id}`, { method: 'DELETE' });

    current.projects = (current.projects || []).filter(item => item.id !== id);
    saveLocalData(current);
    return true;
  },

  // 5. Certificates CRUD
  async addCertificate(certItem) {
    const current = getLocalData();
    const newItem = { id: `cert-${Date.now()}`, ...certItem };

    await apiFetch('/api/portfolio/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    current.certificates = [newItem, ...(current.certificates || [])];
    saveLocalData(current);
    return newItem;
  },

  async updateCertificate(id, certItem) {
    const current = getLocalData();

    await apiFetch(`/api/portfolio/certificates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certItem)
    });

    current.certificates = (current.certificates || []).map(item => item.id === id ? { ...item, ...certItem } : item);
    saveLocalData(current);
    return { id, ...certItem };
  },

  async deleteCertificate(id) {
    const current = getLocalData();

    await apiFetch(`/api/portfolio/certificates/${id}`, { method: 'DELETE' });

    current.certificates = (current.certificates || []).filter(item => item.id !== id);
    saveLocalData(current);
    return true;
  },

  // 6. Education CRUD
  async addEducation(eduItem) {
    const current = getLocalData();
    const newItem = { id: `edu-${Date.now()}`, ...eduItem };

    await apiFetch('/api/portfolio/education', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    current.education = [newItem, ...(current.education || [])];
    saveLocalData(current);
    return newItem;
  },

  async updateEducation(id, eduItem) {
    const current = getLocalData();

    await apiFetch(`/api/portfolio/education/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eduItem)
    });

    current.education = (current.education || []).map(item => item.id === id ? { ...item, ...eduItem } : item);
    saveLocalData(current);
    return { id, ...eduItem };
  },

  async deleteEducation(id) {
    const current = getLocalData();

    await apiFetch(`/api/portfolio/education/${id}`, { method: 'DELETE' });

    current.education = (current.education || []).filter(item => item.id !== id);
    saveLocalData(current);
    return true;
  },

  // 7. Contact Messages
  async sendMessage(messageData, recipientEmail) {
    const msg = {
      ...messageData,
      createdAt: new Date().toISOString(),
      read: false
    };

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
    } catch (fErr) {
      console.warn('FormSubmit note:', fErr);
    }

    const current = getLocalData();
    const newMsg = { id: `msg-${Date.now()}`, ...msg };

    try {
      await apiFetch('/api/portfolio/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch (err) {
      console.warn('Could not save message to MongoDB:', err.message);
    }

    current.messages = [newMsg, ...(current.messages || [])];
    saveLocalData(current);
    return newMsg;
  },

  async markMessageRead(id, readState = true) {
    const current = getLocalData();
    current.messages = (current.messages || []).map(m => m.id === id ? { ...m, read: readState } : m);
    saveLocalData(current);

    try {
      await apiFetch(`/api/portfolio/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: readState })
      });
    } catch (err) {
      console.warn('Could not update message read state in MongoDB:', err.message);
    }

    return true;
  },

  async deleteMessage(id) {
    const current = getLocalData();
    current.messages = (current.messages || []).filter(m => m.id !== id);
    saveLocalData(current);

    try {
      await apiFetch(`/api/portfolio/messages/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete message from MongoDB:', err.message);
    }

    return true;
  },

  // 8. One-Click Cloud Synchronization: Pushes entire dataset to MongoDB Atlas
  async syncMongoAtlas(dataToSync) {
    const payload = dataToSync || getLocalData();
    const res = await apiFetch('/api/portfolio/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    saveLocalData(payload);
    return res;
  },

  // Backward compatibility alias for seed
  async seedMongoAtlas(dataToSync) {
    return await this.syncMongoAtlas(dataToSync);
  },

  // Restore factory seed data
  resetToDefaults() {
    saveLocalData(initialPortfolioData);
    return initialPortfolioData;
  },

  // Export all portfolio data to a JSON string
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
  }
};
