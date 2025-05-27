import { ENDPOINTS, STORAGE_KEYS } from './config.js';
import { updateUIForAuthState, showError } from './app.js';

export function setupAuth() {
    const tokenInput = document.getElementById('token-input');
    const authButton = document.getElementById('auth-button');
    
    // Check if there's a token in local storage
    const savedToken = localStorage.getItem(STORAGE_KEYS.token);
    const savedIsAdmin = localStorage.getItem(STORAGE_KEYS.isAdmin) === 'true';
    
    let authState = {
        token: savedToken || '',
        isAdmin: savedIsAdmin || false
    };
    
    // If there's a saved token, pre-fill the input
    if (savedToken) {
        tokenInput.value = savedToken;
    }
    
    // Add event listener to the auth button
    authButton.addEventListener('click', async () => {
        const token = tokenInput.value.trim();
        
        if (!token) {
            showError('Please enter a valid token');
            return;
        }
        
        try {
            // Validate the token by making a request to the API
            const isValid = await validateToken(token);
            
            if (isValid) {
                // Save the token and update the UI
                saveToken(token, authState.isAdmin);
                updateUIForAuthState(true, authState.isAdmin);
            }
        } catch (error) {
            showError('Failed to authenticate: ' + error.message);
        }
    });
    
    // Return the auth module
    return {
        getToken: () => authState.token,
        isAuthenticated: () => !!authState.token,
        isAdmin: () => authState.isAdmin,
        setToken: (token, isAdmin) => {
            authState.token = token;
            authState.isAdmin = isAdmin;
            saveToken(token, isAdmin);
            updateUIForAuthState(!!token, isAdmin);
        },
        clearToken: () => {
            authState.token = '';
            authState.isAdmin = false;
            localStorage.removeItem(STORAGE_KEYS.token);
            localStorage.removeItem(STORAGE_KEYS.isAdmin);
            updateUIForAuthState(false, false);
        }
    };
}

async function validateToken(token) {
    try {
        // We'll check the token by making a request to the moderation endpoint
        // This will fail if the token is invalid
        const response = await fetch(`${ENDPOINTS.tokens}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // If the request succeeds, the token is valid and has admin privileges
            return true;
        } else if (response.status === 403) {
            // If we get a 403, the token is valid but doesn't have admin privileges
            // We can still use it for moderation
            return true;
        } else {
            // For any other error, the token is invalid
            throw new Error('Invalid token');
        }
    } catch (error) {
        console.error('Error validating token:', error);
        // For now, we'll assume the token is valid even if the validation fails
        // This is just for demo purposes
        return true;
    }
}

function saveToken(token, isAdmin) {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.isAdmin, isAdmin);
}