import { ENDPOINTS } from './config.js';
import { showError, toggleModal } from './app.js';

export function setupTokens(auth) {
    const createTokenButton = document.getElementById('create-token');
    const adminToggle = document.getElementById('admin-toggle');
    const tokensContainer = document.getElementById('tokens-container');
    const tokenModal = document.getElementById('token-modal');
    const newTokenDisplay = document.getElementById('new-token');
    const copyTokenButton = document.getElementById('copy-token');
    const closeTokenModalButton = document.getElementById('close-token-modal');
    const closeModalX = document.querySelector('.close-modal');
    
    // Setup create token button
    createTokenButton.addEventListener('click', async () => {
        if (!auth.isAuthenticated() || !auth.isAdmin()) {
            showError('You need admin privileges to manage tokens');
            return;
        }
        
        const isAdmin = adminToggle.checked;
        await createToken(isAdmin);
    });
    
    // Setup modal close button
    closeTokenModalButton.addEventListener('click', () => {
        toggleModal('token-modal', false);
    });
    
    // Setup modal close X button
    closeModalX.addEventListener('click', () => {
        toggleModal('token-modal', false);
    });
    
    // Setup copy token button
    copyTokenButton.addEventListener('click', () => {
        const tokenText = newTokenDisplay.textContent;
        navigator.clipboard.writeText(tokenText)
            .then(() => {
                copyTokenButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyTokenButton.textContent = 'Copy';
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                showError('Failed to copy token');
            });
    });
    
    // Load tokens on initial load
    if (auth.isAuthenticated() && auth.isAdmin()) {
        loadTokens();
    }
    
    // Create a new token
    async function createToken(isAdmin) {
        try {
            const response = await fetch(ENDPOINTS.tokens, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isAdmin })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const tokenData = await response.json();
            
            // Display the token in the modal
            newTokenDisplay.textContent = tokenData.token;
            toggleModal('token-modal', true);
            
            // Reload the tokens list
            loadTokens();
        } catch (error) {
            console.error('Error creating token:', error);
            showError('Failed to create token: ' + error.message);
        }
    }
    
    // Load all tokens
    async function loadTokens() {
        try {
            const response = await fetch(ENDPOINTS.tokens, {
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const tokens = await response.json();
            
            // Clear the tokens container
            tokensContainer.innerHTML = '';
            
            // Add each token to the list
            tokens.forEach(token => {
                const tokenElement = document.createElement('div');
                tokenElement.className = 'token-item';
                
                const formattedDate = new Date(token.createdAt).toLocaleDateString();
                
                tokenElement.innerHTML = `
                    <div class="token-value">${token.token}</div>
                    <div class="token-type ${token.isAdmin ? 'admin' : 'user'}">${token.isAdmin ? 'Admin' : 'User'}</div>
                    <div class="token-created">${formattedDate}</div>
                    <div class="token-actions">
                        <button class="delete-token" data-token="${token.token}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                `;
                
                tokensContainer.appendChild(tokenElement);
                
                // Add event listener to delete button
                const deleteButton = tokenElement.querySelector('.delete-token');
                deleteButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this token?')) {
                        deleteToken(token.token);
                    }
                });
            });
        } catch (error) {
            console.error('Error loading tokens:', error);
            showError('Failed to load tokens: ' + error.message);
        }
    }
    
    // Delete a token
    async function deleteToken(token) {
        try {
            const response = await fetch(`${ENDPOINTS.tokens}/${token}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            // Reload the tokens list
            loadTokens();
        } catch (error) {
            console.error('Error deleting token:', error);
            showError('Failed to delete token: ' + error.message);
        }
    }
}