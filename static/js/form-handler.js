// Form validation, PWA Queue scheduling and sequential download stream coordinator
window.formHandler = {
    /**
     * Disable/enable form inputs
     */
    setInputsDisabled(disabled) {
        const urlInput = document.getElementById('url-input');
        const pathInput = document.getElementById('path-input');
        const browseButton = document.getElementById('browse-button');
        const formatSelect = document.getElementById('format-select');
        const downloadButton = document.getElementById('download-button');
        const segmentedButtons = document.querySelectorAll('.segmented-button');

        if (urlInput) urlInput.disabled = disabled;
        if (pathInput) pathInput.disabled = disabled;
        if (browseButton) browseButton.disabled = disabled;
        if (formatSelect) formatSelect.disabled = disabled;
        if (downloadButton) downloadButton.disabled = disabled;
        
        segmentedButtons.forEach(btn => {
            btn.disabled = disabled;
        });
    },

    /**
     * Handle form submission - Fetches playlist/video details and schedules downloads
     */
    async handleFormSubmit(event) {
        event.preventDefault();

        const urlInput = document.getElementById('url-input');
        const pathInput = document.getElementById('path-input');
        const formatSelect = document.getElementById('format-select');

        if (!urlInput || !formatSelect) return;

        const url = urlInput.value.trim();
        const path = pathInput ? pathInput.value.trim() : '';
        const format = formatSelect.value;

        if (!url) {
            window.statusDisplay.showError('Please enter a URL to download.');
            return;
        }

        // Lock form UI and show initial load
        window.formHandler.setInputsDisabled(true);
        window.statusDisplay.showLoading();

        try {
            // 1. Fetch metadata (playlist or video)
            const result = await window.downloaderAPI.fetchInfo(url);
            
            if (!result.success || !result.items || result.items.length === 0) {
                window.statusDisplay.showError(result.message || 'Failed to fetch media details.');
                window.formHandler.setInputsDisabled(false);
                return;
            }

            // 2. Setup Queue Panel and list items
            const queuePanel = document.getElementById('queue-panel');
            const queueList = document.getElementById('queue-list');
            
            if (queuePanel && queueList) {
                queueList.innerHTML = ''; // clear prior downloads
                queuePanel.classList.remove('hidden');

                result.items.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.className = 'queue-card';
                    card.id = `queue-card-${item.id || index}`;
                    
                    // Fallback thumbnail if missing
                    const thumbUrl = item.thumbnail || '/static/images/icon.svg';
                    
                    card.innerHTML = `
                        <img class="queue-thumb" src="${thumbUrl}" alt="Media thumbnail" onerror="this.src='/static/images/icon.svg'">
                        <div class="queue-info">
                            <span class="queue-title">${item.title}</span>
                            <span class="queue-artist">${item.artist}</span>
                            <div class="progress-bar-container">
                                <div class="progress-bar" id="progress-${item.id || index}" style="width: 0%"></div>
                            </div>
                            <span class="progress-label" id="label-${item.id || index}">Pending</span>
                        </div>
                    `;
                    queueList.appendChild(card);
                });
            }

            // 3. Process Queue Sequentially
            await window.formHandler.processQueue(result.items, format, path);

        } catch (err) {
            window.statusDisplay.showError(`Execution failure: ${err.message}`);
            window.formHandler.setInputsDisabled(false);
        }
    },

    /**
     * Process list of downloads one by one
     */
    async processQueue(items, format, path) {
        let successCount = 0;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemId = item.id || i;
            const card = document.getElementById(`queue-card-${itemId}`);
            const progressBar = document.getElementById(`progress-${itemId}`);
            const progressLabel = document.getElementById(`label-${itemId}`);

            // Set current item active
            if (card) card.className = 'queue-card active';
            if (progressLabel) progressLabel.textContent = 'Connecting...';
            
            window.statusDisplay.showProgress(i + 1, items.length, item.title);

            // Wait for download stream to complete
            const downloadPromise = new Promise((resolve) => {
                window.downloaderAPI.downloadStream(
                    item.url,
                    format,
                    path,
                    (percent) => {
                        // onProgress
                        if (progressBar) progressBar.style.width = `${percent}%`;
                        if (progressLabel) progressLabel.textContent = `Downloading... ${Math.round(percent)}%`;
                    },
                    (filename) => {
                        // onComplete
                        if (card) card.className = 'queue-card complete';
                        if (progressLabel) {
                            progressLabel.innerHTML = `Finished. <a href="/downloads/${encodeURIComponent(filename)}" class="device-download-btn" download="${filename}">Save to Device</a>`;
                        }
                        successCount++;
                        resolve(true);
                    },
                    (errorMsg) => {
                        // onError
                        console.error('Download error:', errorMsg);
                        if (card) card.className = 'queue-card error';
                        if (progressLabel) progressLabel.textContent = 'Failed';
                        resolve(false);
                    }
                );
            });

            await downloadPromise;
        }

        // Entire queue finished
        window.statusDisplay.showQueueComplete(successCount, items.length);
        window.formHandler.setInputsDisabled(false);
    },

    /**
     * Trigger directory validation from input prompt
     */
    async handleBrowseClick() {
        const pathInput = document.getElementById('path-input');
        if (!pathInput) return;

        const currentPath = pathInput.value.trim();
        const targetPath = prompt("Enter absolute folder path for downloads:", currentPath || "");
        
        if (targetPath === null) {
            return;
        }

        window.formHandler.setInputsDisabled(true);
        try {
            const result = await window.downloaderAPI.browseDirectory(targetPath.trim());
            if (result.success && result.path) {
                pathInput.value = result.path;
                // Trigger input event to float label
                pathInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                window.statusDisplay.showError(result.message || 'Validation failed.');
            }
        } catch (err) {
            window.statusDisplay.showError(`Browsing error: ${err.message}`);
        } finally {
            window.formHandler.setInputsDisabled(false);
        }
    }
};
