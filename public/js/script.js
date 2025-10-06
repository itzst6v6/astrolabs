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

    function saveFileHistory(fileData) {
        const history = getFileHistory();
        history.unshift(fileData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    // --- UI Rendering ---
    function renderFileHistory() {
        fileListContainer.innerHTML = '';
        const history = getFileHistory();
        if (history.length === 0) {
            fileListContainer.innerHTML = '<div style="text-align:center;color:var(--subtle-text-color);padding:20px;">Your file history is empty.</div>';
            return;
        }

        history.forEach(file => {
            const card = document.createElement('div');
            card.className = 'file-card';
            // FIXED: Replaced the broken string with a valid template literal (using backticks ``)
            // and correctly inserted the file name and token variables.
            const fullUrl = `${window.location.origin}/.netlify/functions/download/${file.token}`;
            card.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-token" title="Click Copy to copy full download URL">Token: ${file.token}</div>
                </div>
                <button class="btn btn-small" data-action="copy" data-token="${file.token}" title="Copy full download URL">Copy</button>
                <button class="btn btn-small" data-action="download" data-token="${file.token}" style="background-color:var(--accent-color);" title="Download file directly">DL</button>
            `;
            fileListContainer.appendChild(card);
        });
    }

    // --- Event Listeners for Upload and File Actions ---
    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (file) {
            // Get platform-specific file size limit
    // For now, use conservative estimate - this could be made dynamic
    const maxSize = 4 * 1024 * 1024; // 4MB (will be made dynamic later)
            if (file.size > maxSize) {
                fileNameSpan.textContent = 'File too large (max 4MB)';
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

    uploadForm.addEventListener('submit', e => {
        e.preventDefault();
        uploadStatus.textContent = 'Uploading...';
        const formData = new FormData();
        if (fileInput.files && fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        } else {
            throw new Error('No file selected.');
        }

        fetch('/.netlify/functions/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                // Handle non-JSON error responses (like 413 errors)
                if (response.status === 413) {
                    throw new Error('413: File too large. Please choose a smaller file (max 4MB).');
                }
                // Try to parse JSON error, but handle cases where it's not JSON
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch {
                        throw new Error(`HTTP ${response.status}: ${text || 'Unknown error'}`);
                    }
                }).then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            uploadStatus.style.color = 'green';
            uploadStatus.textContent = 'Upload successful!';
            saveFileHistory({ name: fileInput.files[0].name, token: data.publicToken });
            renderFileHistory();
            uploadForm.reset();
            fileNameSpan.textContent = 'Choose a file...';
        })
        .catch(err => {
            uploadStatus.style.color = 'red';

            // Handle specific error types
            if (err.message && err.message.includes('413')) {
                uploadStatus.textContent = 'File too large. Please choose a smaller file (max 4MB).';
            } else if (err.message && err.message.includes('Request Entity')) {
                uploadStatus.textContent = 'Upload failed. File may be too large or corrupted.';
            } else {
                uploadStatus.textContent = err.message || 'Upload failed. Please try again.';
            }

            console.error('Upload error:', err);
        });
    });

    fileListContainer.addEventListener('click', e => {
        const action = e.target.dataset.action;
        const token = e.target.dataset.token;

        if (!action || !token) return;

        if (action === 'download') {
            // FIXED: Replaced the broken line with a valid template literal for the URL.
            window.location.href = `/.netlify/functions/download/${token}`;
        }
        if (action === 'copy') {
            // Copy full download URL instead of just the token
            const fullUrl = `${window.location.origin}/.netlify/functions/download/${token}`;
            navigator.clipboard.writeText(fullUrl).then(() => {
                const originalText = e.target.textContent;
                e.target.textContent = 'Copied!';
                setTimeout(() => { e.target.textContent = originalText; }, 2000);
            }).catch(err => {
                console.error('Failed to copy URL:', err);
                // Fallback to copying just the token if clipboard fails
                navigator.clipboard.writeText(token).then(() => {
                    e.target.textContent = 'Copied!';
                    setTimeout(() => { e.target.textContent = originalText; }, 2000);
                });
            });
        }
    });

    // --- Initial Render on Page Load ---
    renderFileHistory();
});