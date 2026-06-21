// DOM status updates for PWA queueing, progress bars, and execution states
window.statusDisplay = {
    /**
     * Show initial metadata fetching state
     */
    showLoading() {
        const panel = document.getElementById('status-panel');
        const spinner = document.getElementById('status-spinner');
        const title = document.getElementById('status-title');
        const message = document.getElementById('status-message');

        if (!panel || !spinner || !title || !message) return;

        panel.classList.remove('hidden');
        panel.className = 'status-panel loading';
        spinner.classList.remove('hidden');
        title.textContent = 'FETCHING METADATA';
        message.textContent = 'Parsing link and retrieving details...';
    },

    /**
     * Show queue-specific downloading progress
     * @param {number} current - Current index (1-based)
     * @param {number} total - Total number of items
     * @param {string} itemTitle - Name of currently active item
     */
    showProgress(current, total, itemTitle) {
        const panel = document.getElementById('status-panel');
        const spinner = document.getElementById('status-spinner');
        const title = document.getElementById('status-title');
        const message = document.getElementById('status-message');

        if (!panel || !spinner || !title || !message) return;

        panel.classList.remove('hidden');
        panel.className = 'status-panel loading';
        spinner.classList.remove('hidden');
        title.textContent = `DOWNLOADING (${current}/${total})`;
        message.textContent = itemTitle;
    },

    /**
     * Show final queue execution summary
     * @param {number} successCount - Successful downloads count
     * @param {number} totalCount - Total download items count
     */
    showQueueComplete(successCount, totalCount) {
        const panel = document.getElementById('status-panel');
        const spinner = document.getElementById('status-spinner');
        const title = document.getElementById('status-title');
        const message = document.getElementById('status-message');

        if (!panel || !spinner || !title || !message) return;

        spinner.classList.add('hidden');
        
        if (successCount === totalCount) {
            panel.className = 'status-panel success';
            title.textContent = 'ALL DOWNLOADS COMPLETE';
            message.textContent = `Successfully downloaded ${successCount} items.`;
        } else if (successCount > 0) {
            panel.className = 'status-panel error'; // warning background
            title.textContent = 'PARTIALLY COMPLETE';
            message.textContent = `Downloaded ${successCount} of ${totalCount} items successfully.`;
        } else {
            panel.className = 'status-panel error';
            title.textContent = 'ALL DOWNLOADS FAILED';
            message.textContent = 'Could not download any item from URL.';
        }
    },

    /**
     * Legacy success route
     */
    showSuccess(filename) {
        const panel = document.getElementById('status-panel');
        const spinner = document.getElementById('status-spinner');
        const title = document.getElementById('status-title');
        const message = document.getElementById('status-message');

        if (!panel || !spinner || !title || !message) return;

        panel.classList.remove('hidden');
        panel.className = 'status-panel success';
        spinner.classList.add('hidden');
        title.textContent = 'DOWNLOAD SUCCESSFUL';
        message.textContent = `Saved as: ${filename}`;
    },

    /**
     * Display error banner
     * @param {string} errMessage - Error message details
     */
    showError(errMessage) {
        const panel = document.getElementById('status-panel');
        const spinner = document.getElementById('status-spinner');
        const title = document.getElementById('status-title');
        const message = document.getElementById('status-message');

        if (!panel || !spinner || !title || !message) return;

        panel.classList.remove('hidden');
        panel.className = 'status-panel error';
        spinner.classList.add('hidden');
        title.textContent = 'DOWNLOAD FAILED';
        message.textContent = errMessage || 'An unknown error occurred.';
    }
};
