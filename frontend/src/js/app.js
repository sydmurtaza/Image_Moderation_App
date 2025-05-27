import { setupAuth } from './auth.js';
import { setupModeration } from './moderation.js';
import { setupTokens } from './tokens.js';
import { API_URL } from './config.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation
    setupNavigation();
    
    // Set up authentication
    const auth = setupAuth();
    
    // Set up moderation functionality
    setupModeration(auth);
    
    // Set up token management
    setupTokens(auth);
    
    // Initialize the UI based on authentication state
    updateUIForAuthState(auth.isAuthenticated(), auth.isAdmin());
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav a');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show the corresponding section
            const sectionId = link.getAttribute('data-section');
            const section = document.getElementById(`${sectionId}-section`);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

export function updateUIForAuthState(isAuthenticated, isAdmin) {
    const authContainer = document.getElementById('auth-container');
    const moderationSection = document.getElementById('moderation-section');
    const tokensSection = document.getElementById('tokens-section');
    const adminNotice = document.getElementById('admin-notice');
    const tokenManagement = document.getElementById('token-management');
    
    if (isAuthenticated) {
        // Hide auth container
        authContainer.style.display = 'none';
        
        // Show moderation section
        moderationSection.classList.add('active');
        
        // Update tokens section based on admin status
        if (isAdmin) {
            adminNotice.style.display = 'none';
            tokenManagement.style.display = 'block';
        } else {
            adminNotice.style.display = 'block';
            tokenManagement.style.display = 'none';
        }
    } else {
        // Show auth container
        authContainer.style.display = 'block';
        
        // Hide other sections
        moderationSection.classList.remove('active');
        
        // Show admin notice in tokens section
        adminNotice.style.display = 'block';
        tokenManagement.style.display = 'none';
    }
}

// Helper functions for UI manipulation
export function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'block';
}

export function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'none';
}

export function showFlexElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'flex';
}

export function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (modal) {
        if (show) {
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
        }
    }
}

// Error handling
export function showError(message) {
    // This could be enhanced to show a toast notification or other UI element
    console.error(message);
    alert(message);
}