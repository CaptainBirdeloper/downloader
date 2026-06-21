// API utility for Flask endpoints, upgraded to support streaming downloads and playlist queries
window.downloaderAPI = {
    /**
     * Fetch metadata (playlist or single video)
     * @param {string} url - Target URL to query
     * @returns {Promise<Object>} Response containing {success, title, is_playlist, items}
     */
    async fetchInfo(url) {
        try {
            const response = await fetch('/info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: `Network error: ${error.message || 'Connection failed'}`
            };
        }
    },

    /**
     * Start a real-time download stream using Server-Sent Events (SSE)
     * @param {string} url - Video URL to download
     * @param {string} format - Output format
     * @param {string} path - Custom download directory path (optional)
     * @param {Function} onProgress - Callback for progress (percent: number)
     * @param {Function} onComplete - Callback for completion (filename: string)
     * @param {Function} onError - Callback for failure (message: string)
     * @returns {EventSource} The event source handle
     */
    downloadStream(url, format, path, onProgress, onComplete, onError) {
        const queryParams = new URLSearchParams({
            url: url,
            format: format,
            path: path || ''
        });
        
        const eventSource = new EventSource(`/download-stream?${queryParams.toString()}`);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.status === 'downloading') {
                    onProgress(data.progress);
                } else if (data.status === 'complete') {
                    eventSource.close();
                    onComplete(data.filename);
                } else if (data.status === 'error') {
                    eventSource.close();
                    onError(data.message);
                }
            } catch (err) {
                eventSource.close();
                onError(`Stream parse failure: ${err.message}`);
            }
        };
        
        eventSource.onerror = (err) => {
            eventSource.close();
            onError("Connection to download stream was lost.");
        };
        
        return eventSource;
    },

    /**
     * Legacy download endpoint (fallback)
     */
    async postDownload(url, format, path) {
        try {
            const response = await fetch('/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, format, path })
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                filename: '',
                message: `Network error: ${error.message || 'Connection failed'}`
            };
        }
    },

    /**
     * Trigger backend native folder picker dialog
     * @returns {Promise<Object>} Response containing {success, path, message}
     */
    async browseDirectory() {
        try {
            const response = await fetch('/browse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                path: '',
                message: `Network error: ${error.message || 'Connection failed'}`
            };
        }
    }
};
