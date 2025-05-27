import { ENDPOINTS, UPLOAD_CONFIG } from './config.js';
import { showElement, hideElement, showFlexElement, showError } from './app.js';

export function setupModeration(auth) {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    const previewImage = document.getElementById('preview-image');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const removeFileButton = document.getElementById('remove-file');
    const uploadButton = document.getElementById('upload-button');
    const loader = document.getElementById('loader');
    const results = document.getElementById('results');
    const resultStatus = document.getElementById('result-status');
    const categoriesContainer = document.getElementById('categories-container');
    const analysisTime = document.getElementById('analysis-time');
    
    let selectedFile = null;
    
    // Setup drag and drop
    setupDragAndDrop(uploadArea);
    
    // Setup file input change event
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    // Setup remove file button
    removeFileButton.addEventListener('click', () => {
        resetFileSelection();
    });
    
    // Setup upload button
    uploadButton.addEventListener('click', async () => {
        if (!selectedFile) {
            showError('Please select an image to analyze');
            return;
        }
        
        if (!auth.isAuthenticated()) {
            showError('Please authenticate first');
            return;
        }
        
        await uploadAndModerateImage(selectedFile, auth.getToken());
    });
    
    // Handle file selection
    function handleFileSelection(file) {
        // Validate file type
        if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
            showError(`Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`);
            return;
        }
        
        // Validate file size
        if (file.size > UPLOAD_CONFIG.maxSizeMB * 1024 * 1024) {
            showError(`File too large. Maximum size is ${UPLOAD_CONFIG.maxSizeMB} MB`);
            return;
        }
        
        // Set the selected file
        selectedFile = file;
        
        // Update the UI
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        hideElement('upload-area');
        showFlexElement('file-preview');
        showElement('upload-button');
        hideElement('results');
    }
    
    // Reset file selection
    function resetFileSelection() {
        selectedFile = null;
        fileInput.value = '';
        previewImage.src = '';
        
        showElement('upload-area');
        hideElement('file-preview');
        hideElement('upload-button');
        hideElement('results');
    }
    
    // Upload and moderate image
    async function uploadAndModerateImage(file, token) {
        try {
            // Show loader
            hideElement('upload-button');
            showFlexElement('loader');
            
            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            
            // Send request to API
            const response = await fetch(ENDPOINTS.moderate, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            // Parse response
            const result = await response.json();
            
            // Display results
            displayResults(result);
        } catch (error) {
            console.error('Error moderating image:', error);
            showError('Failed to analyze image: ' + error.message);
            
            // Hide loader and show upload button again
            hideElement('loader');
            showElement('upload-button');
        }
    }
    
    // Display moderation results
    function displayResults(result) {
        // Hide loader
        hideElement('loader');
        
        // Update status
        resultStatus.className = 'result-status ' + (result.safe ? 'safe' : 'unsafe');
        
        const statusIcon = resultStatus.querySelector('.status-icon');
        statusIcon.className = 'status-icon ' + (result.safe ? 'safe' : 'unsafe');
        statusIcon.innerHTML = result.safe 
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        
        const statusText = resultStatus.querySelector('.status-text');
        statusText.className = 'status-text ' + (result.safe ? 'safe' : 'unsafe');
        statusText.textContent = result.message;
        
        // Clear and update categories
        categoriesContainer.innerHTML = '';
        
        if (result.categories && result.categories.length > 0) {
            result.categories.forEach(category => {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'category';
                
                const severityClass = category.severity;
                const confidencePercentage = Math.round(category.confidence * 100);
                
                categoryElement.innerHTML = `
                    <div class="category-header">
                        <span class="category-name">${category.name}</span>
                        <span class="category-confidence">${confidencePercentage}% confidence</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${severityClass}" style="width: ${confidencePercentage}%"></div>
                    </div>
                `;
                
                categoriesContainer.appendChild(categoryElement);
            });
        } else {
            const noCategories = document.createElement('p');
            noCategories.textContent = 'No concerning content detected';
            categoriesContainer.appendChild(noCategories);
        }
        
        // Update analysis time
        analysisTime.textContent = `${result.analysis_time.toFixed(2)}s`;
        
        // Show results
        showElement('results');
    }
    
    // Setup drag and drop
    function setupDragAndDrop(dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropArea.classList.add('drag-over');
        }
        
        function unhighlight() {
            dropArea.classList.remove('drag-over');
        }
        
        dropArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        }
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1048576) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / 1048576).toFixed(1) + ' MB';
        }
    }
}