// Cloudflare Media & Storage Service
// Supports Cloudflare R2 object storage, Cloudflare Workers uploads, and automatic client-side compression fallback

const r2PublicUrl = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || '';
const uploadEndpoint = import.meta.env.VITE_CLOUDFLARE_UPLOAD_ENDPOINT || '';

export const isCloudflareConfigured = Boolean(
  (r2PublicUrl && r2PublicUrl.trim() !== '' && !r2PublicUrl.includes('YOUR_')) ||
  (uploadEndpoint && uploadEndpoint.trim() !== '' && !uploadEndpoint.includes('YOUR_'))
);

// High-performance client-side image compression fallback
export const compressImageToDataUrl = (file, maxDimension = 800, quality = 0.75) => {
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

export const cloudflareStorageService = {
  isConfigured() {
    return isCloudflareConfigured;
  },

  getConfigInfo() {
    return {
      configured: isCloudflareConfigured,
      r2PublicUrl,
      uploadEndpoint
    };
  },

  // Test Cloudflare connectivity
  async testConnection() {
    if (!isCloudflareConfigured) {
      return {
        success: false,
        code: 'NOT_CONFIGURED',
        message: 'Cloudflare R2 keys are not set in .env. Smart compression fallback is active.'
      };
    }

    try {
      const testTarget = uploadEndpoint || r2PublicUrl;
      const res = await fetch(testTarget, { method: 'HEAD', mode: 'no-cors' });
      return {
        success: true,
        endpoint: testTarget,
        message: 'Cloudflare storage endpoint is reachable!'
      };
    } catch (err) {
      return {
        success: false,
        code: 'CLOUDFLARE_UNREACHABLE',
        message: err.message || 'Could not reach Cloudflare endpoint.',
        endpoint: uploadEndpoint || r2PublicUrl
      };
    }
  },

  // Upload an image file directly to Cloudflare R2 or fall back to smart local compression
  async uploadImage(file, folder = 'projects') {
    if (!file) return null;

    // 1. If a Cloudflare upload worker/presigned endpoint is configured
    if (uploadEndpoint) {
      try {
        const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const targetUrl = `${uploadEndpoint.replace(/\/+$/, '')}/${folder}/${cleanName}`;

        const response = await fetch(targetUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'image/jpeg'
          },
          body: file
        });

        if (response.ok) {
          const publicBase = r2PublicUrl.replace(/\/+$/, '');
          const downloadUrl = publicBase ? `${publicBase}/${folder}/${cleanName}` : targetUrl;
          console.log('✅ Uploaded image successfully to Cloudflare R2:', downloadUrl);
          return downloadUrl;
        }
      } catch (err) {
        console.warn('Cloudflare upload encountered an issue, falling back to smart compression:', err);
      }
    }

    // 2. Fallback: Instant high-performance compressed inline Data URL
    return await compressImageToDataUrl(file);
  }
};
