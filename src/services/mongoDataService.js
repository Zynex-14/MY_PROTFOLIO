// MongoDB Atlas Data API Service
// Allows direct HTTPS interaction with MongoDB Atlas from modern client applications

const atlasUrl = import.meta.env.VITE_MONGODB_ATLAS_URL || '';
const apiKey = import.meta.env.VITE_MONGODB_API_KEY || '';
const cluster = import.meta.env.VITE_MONGODB_CLUSTER || 'Cluster0';
const database = import.meta.env.VITE_MONGODB_DATABASE || 'portfolio_db';

export const isMongoConfigured = Boolean(
  atlasUrl &&
  apiKey &&
  atlasUrl.trim() !== '' &&
  apiKey.trim() !== '' &&
  !atlasUrl.includes('YOUR_') &&
  !apiKey.includes('YOUR_')
);

const executeAction = async (action, payload) => {
  if (!isMongoConfigured) {
    throw new Error('MongoDB Atlas Data API is not configured. Please check your .env variables.');
  }

  // Clean trailing slash from base url
  const cleanUrl = atlasUrl.replace(/\/+$/, '');
  const endpoint = `${cleanUrl}/action/${action}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      dataSource: cluster,
      database: database,
      ...payload
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MongoDB Atlas API error (${response.status}): ${errorText || response.statusText}`);
  }

  return await response.json();
};

export const mongoDataService = {
  isConfigured() {
    return isMongoConfigured;
  },

  getConfigInfo() {
    return {
      configured: isMongoConfigured,
      endpoint: atlasUrl,
      cluster,
      database
    };
  },

  // Test connection to MongoDB Atlas
  async testConnection() {
    if (!isMongoConfigured) {
      return {
        success: false,
        code: 'NOT_CONFIGURED',
        message: 'MongoDB Atlas keys are not set in .env. Falling back to local storage.'
      };
    }

    try {
      // Attempt a lightweight find query on a health check collection
      const res = await executeAction('findOne', {
        collection: 'portfolio',
        filter: { _id: 'health_check' }
      });

      return {
        success: true,
        cluster,
        database,
        message: `Successfully connected to MongoDB Atlas cluster "${cluster}" database "${database}"!`
      };
    } catch (err) {
      return {
        success: false,
        code: 'CONNECTION_FAILED',
        message: err.message || 'Failed to connect to MongoDB Atlas Data API',
        cluster,
        database
      };
    }
  },

  // Find all documents in a collection
  async find(collectionName, filter = {}, sort = null, limit = 100) {
    const payload = {
      collection: collectionName,
      filter
    };
    if (sort) payload.sort = sort;
    if (limit) payload.limit = limit;

    const data = await executeAction('find', payload);
    return data?.documents || [];
  },

  // Find one document
  async findOne(collectionName, filter = {}) {
    const data = await executeAction('findOne', {
      collection: collectionName,
      filter
    });
    return data?.document || null;
  },

  // Insert one document
  async insertOne(collectionName, document) {
    const data = await executeAction('insertOne', {
      collection: collectionName,
      document
    });
    return {
      id: data?.insertedId,
      ...document
    };
  },

  // Update one document
  async updateOne(collectionName, filter, updateData, upsert = true) {
    const data = await executeAction('updateOne', {
      collection: collectionName,
      filter,
      update: { $set: updateData },
      upsert
    });
    return data;
  },

  // Delete one document
  async deleteOne(collectionName, filter) {
    const data = await executeAction('deleteOne', {
      collection: collectionName,
      filter
    });
    return data;
  }
};
