// Cloudinary Media Service
// Supports direct unsigned uploads to Cloudinary with smart compression fallback

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = Boolean(
  cloudName &&
  uploadPreset &&
  cloudName.trim() !== '' &&
  uploadPreset.trim() !== '' &&
  !cloudName.includes('YOUR_') &&
  !uploadPreset.includes('YOUR_')
);

// High-performance client-side fallback compressor
const compressFallback = (file, maxDimension = 800, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(event.target.result);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const cloudinaryService = {
  isConfigured() {
    return isCloudinaryConfigured;
  },

  getConfigInfo() {
    return {
      configured: isCloudinaryConfigured,
      cloudName,
      uploadPreset
    };
  },

  // Test Cloudinary connection using unsigned ping
  async testConnection() {
    if (!isCloudinaryConfigured) {
      return {
        success: false,
        code: 'NOT_CONFIGURED',
        message: 'Cloudinary Cloud Name or Upload Preset is missing in .env. Local smart storage is active.'
      };
    }

    try {
      // 1x1 transparent PNG blob for connectivity testing
      const base64Pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await fetch(base64Pixel);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'portfolio/_health_check');

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          cloudName,
          testUrl: data.secure_url,
          message: `Connected to Cloudinary successfully on cloud "${cloudName}"!`
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          code: 'UPLOAD_FAILED',
          message: errData.error?.message || `Cloudinary returned HTTP status ${response.status}`,
          help: 'Check that your Upload Preset is set to "Unsigned" in Cloudinary Console -> Settings -> Upload.'
        };
      }
    } catch (err) {
      return {
        success: false,
        code: 'NETWORK_ERROR',
        message: err.message || 'Could not connect to Cloudinary API.'
      };
    }
  },

  // Upload image file directly to Cloudinary
  async uploadImage(file, folder = 'portfolio/projects') {
    if (!file) return null;

    if (isCloudinaryConfigured) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        if (folder) {
          formData.append('folder', folder);
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Uploaded image successfully to Cloudinary:', data.secure_url);
          return data.secure_url;
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn('⚠️ Cloudinary upload failed, falling back to smart local compression:', errData);
        }
      } catch (err) {
        console.warn('⚠️ Cloudinary network error, falling back to smart local compression:', err);
      }
    }

    // Fallback: Instant smart canvas compression (~25KB)
    return await compressFallback(file);
  }
};
