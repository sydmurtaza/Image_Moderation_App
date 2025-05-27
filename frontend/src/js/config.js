// API configuration
export const API_URL = 'http://localhost:7000';

// API endpoints
export const ENDPOINTS = {
    tokens: `${API_URL}/auth/tokens`,
    moderate: `${API_URL}/moderate`
};

// Local storage keys
export const STORAGE_KEYS = {
    token: 'image_moderation_token',
    isAdmin: 'image_moderation_is_admin'
};

// File upload configuration
export const UPLOAD_CONFIG = {
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};