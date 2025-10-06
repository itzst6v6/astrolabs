document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('overlay');
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const fileNameSpan = document.getElementById('fileName');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileListContainer = document.getElementById('fileListContainer');
    const STORAGE_KEY = 'astroLabFileHistory';

    // --- Navigation and Session Handling ---
    hamburgerBtn.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    overlay.addEventListener('click', () => document.body.classList.toggle('nav-open'));

    // --- Local Storage Functions ---
    function getFileHistory() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function removeFileFromHistory(tokenToRemove) {
        const history = getFileHistory();
        const filteredHistory = history.filter(file => file.token !== tokenToRemove);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
    }

    // --- UI Rendering ---
    function renderFileHistory() {
        fileListContainer.innerHTML = '';
        const history = getFileHistory();
        if (history.length === 0) {
            fileListContainer.innerHTML = '<div style="text-align:center;color:var(--subtle-text-color);padding:20px;">Your file history is empty.</div>';
            return;

        history.forEach(file => {
            const card = document.createElement('div');
            card.className = 'file-card';

            // FIXED: Added the complete HTML structure for the file card.
            // This now includes file information and action buttons.
            card.innerHTML = `
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                </div>
                <div class="file-actions">
                    <button class="btn" data-action="copy" data-token="${file.token}">Copy Link</button>
                    <button class="btn btn-primary" data-action="download" data-token="${file.token}">Download</button>
                    <button class="btn btn-danger" data-action="delete" data-token="${file.token}">Delete</button>
                </div>
            `;
            fileListContainer.appendChild(card);
        });
    }

    // --- Configuration Fetching ---
    async function getConfig() {
        try {
            const response = await fetch('/api/v2/debug/platform');
            if (!response.ok) throw new Error('Failed to fetch config');
            const config = await response.json();
            return {
                maxSize: config.limits.fileSizeBytes,
                maxSizeText: config.limits.fileSize,
                platform: config.name,
                apiBasePath: config.apiBasePath || '/api'
            };
        } catch (error) {
            console.warn('Could not fetch config, using defaults:', error);
            // Fallback to a conservative 4MB limit
            return {
                maxSize: 4 * 1024 * 1024,
                maxSizeText: '4MB',
                platform: 'Unknown',
                apiBasePath: '/api'
            };
        }
    }

    // Initialize config on page load
    let currentConfig = null;
    getConfig().then(config => {
        currentConfig = config;
        console.log('Platform config loaded:', config);

        // Update UI with platform info if needed
        const platformInfo = document.getElementById('platform-info');
        if (platformInfo) {
            platformInfo.textContent = `Running on ${config.platform} (${config.maxSizeText} limit)`;
        }
    });

    // --- Event Listeners for Upload and File Actions ---
    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0]; // Get first file
        if (file) {
            // Use dynamic config if available, otherwise fallback
            const maxSize = currentConfig ? currentConfig.maxSize : 4 * 1024 * 1024;
            const maxSizeText = currentConfig ? currentConfig.maxSizeText : '4MB';

            if (file.size > maxSize) {
                fileNameSpan.textContent = `File too large (max ${maxSizeText})`;
                fileNameSpan.style.color = 'var(--error-color)';
                fileInput.value = ''; // Clear the input
                return;
            }
            fileNameSpan.textContent = file.name;
            fileNameSpan.style.color = ''; // Reset color
        } else {
            fileNameSpan.textContent = 'Choose a file...';
            fileNameSpan.style.color = '';
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files && fileInput.files[0]; // Get first file
        if (!file) {
            uploadStatus.textContent = 'Please select a file to upload.';
            uploadStatus.style.color = 'red';
            return;
        }

        uploadStatus.textContent = 'Uploading...';
        uploadStatus.style.color = '';
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Wait for config to load if not already loaded
            if (!currentConfig) {
                currentConfig = await getConfig();
            }

            const uploadUrl = `${currentConfig.apiBasePath}/v2/upload`;
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                // Handle non-JSON error responses gracefully
                if (response.status === 413) {
                    throw new Error(`413: File is too large. The server limit is ${currentConfig?.maxSizeText || '4MB'}.`);
                }
                const errorText = await response.text();
                try {
                    // Try to parse as JSON for a more detailed error message
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || `HTTP ${response.status}: An unknown error occurred.`);
                } catch {
                    // Fallback if the error response is not JSON
                    throw new Error(`HTTP ${response.status}: ${errorText || 'An unknown error occurred.'}`);
                }
            }

            const data = await response.json();
            uploadStatus.style.color = 'green';
            uploadStatus.textContent = 'Upload successful!';
            saveFileHistory({ name: file.name, token: data.publicToken });
            renderFileHistory();
            uploadForm.reset();
            fileNameSpan.textContent = 'Choose a file...';

        } catch (err) {
            uploadStatus.style.color = 'red';
            uploadStatus.textContent = err.message || 'Upload failed. Please try again.';
            console.error('Upload error:', err);
        }
    });


    fileListContainer.addEventListener('click', async (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton) return;

        const action = targetButton.dataset.action;
        const token = targetButton.dataset.token;

        if (!action || !token) return;

        // Wait for config to load if not already loaded
        if (!currentConfig) {
            currentConfig = await getConfig();
        }

        const downloadUrl = `${currentConfig.apiBasePath || ''}/v2/download/${token}`;

        if (action === 'download') {
            window.location.href = downloadUrl;
        }

        if (action === 'delete') {
            if (confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
                try {
                    const deleteUrl = `${currentConfig.apiBasePath}/v2/delete/${token}`;
                    const response = await fetch(deleteUrl, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        try {
                            const errorJson = JSON.parse(errorText);
                            throw new Error(errorJson.message || `HTTP ${response.status}: Delete failed`);
                        } catch {
                            throw new Error(`HTTP ${response.status}: ${errorText || 'Delete failed'}`);
                        }
                    }

                    const result = await response.json();
                    if (result.success) {
                        // Remove from local storage
                        removeFileFromHistory(token);
                        // Re-render the file list
                        renderFileHistory();
                        alert('File deleted successfully!');
                    } else {
                        throw new Error(result.message || 'Delete failed');
                    }
                } catch (err) {
                    console.error('Delete error:', err);
                    alert('Failed to delete file: ' + err.message);
                }
            }
        }
    });

    // --- Initial Render on Page Load ---
    renderFileHistory();
});