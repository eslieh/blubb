// Cloudinary Configuration
// Replace these values with your actual Cloudinary credentials

export const CLOUDINARY_CONFIG = {
    CLOUD_NAME: 'dfvauxrrg', // Your Cloudinary cloud name
    UPLOAD_PRESET: 'your-upload-preset', // Your upload preset (unsigned)
    API_KEY: '177879511259391', // Optional: for server-side operations
    API_SECRET: 'bamr6l4K-f2ldIsFnEMJqd1pkcM', // Optional: for server-side operations
  };
  
  // Upload presets for different use cases
  export const UPLOAD_PRESETS = {
    DEFAULT: 'ml_default',
    PROJECTS: 'heartframed-projects', // Specific preset for project images
    AVATARS: 'heartframed-avatars', // Specific preset for user avatars
  };
  
  // Image transformation options
  export const IMAGE_TRANSFORMATIONS = {
    THUMBNAIL: {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    },
    PREVIEW: {
      width: 600,
      height: 600,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    },
    FULL_SIZE: {
      width: 'auto',
      height: 'auto',
      crop: 'scale',
      quality: 'auto',
      format: 'auto'
    }
  };

  // Upload image to Cloudinary
  export const uploadImageToCloudinary = async (file, uploadPreset = UPLOAD_PRESETS.AVATARS) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', CLOUDINARY_CONFIG.CLOUD_NAME);
      
      // Add transformation for avatars
      if (uploadPreset === UPLOAD_PRESETS.AVATARS) {
        formData.append('transformation', 'c_fill,w_400,h_400,q_auto,f_auto');
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        data: data
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message || 'Image upload failed'
      };
    }
  };

  // Validate image file
  export const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please select a JPEG, PNG, or WebP image.' 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'File size too large. Please select an image under 5MB.' 
      };
    }

    return { valid: true };
  };

  // Generate optimized image URL with transformations
  export const getOptimizedImageUrl = (publicId, transformation = IMAGE_TRANSFORMATIONS.THUMBNAIL) => {
    if (!publicId) return null;
    
    const transformParams = Object.entries(transformation)
      .map(([key, value]) => {
        const paramMap = {
          width: 'w',
          height: 'h',
          crop: 'c',
          quality: 'q',
          format: 'f'
        };
        return `${paramMap[key] || key}_${value}`;
      })
      .join(',');

    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload/${transformParams}/${publicId}`;
  };
  
  export default CLOUDINARY_CONFIG; 