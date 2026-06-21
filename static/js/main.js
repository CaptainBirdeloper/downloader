// Main entry point for local media downloader app and PWA registrations
document.addEventListener('DOMContentLoaded', () => {
    const downloadForm = document.getElementById('download-form');
    const browseButton = document.getElementById('browse-button');
    
    if (downloadForm) {
        downloadForm.addEventListener('submit', window.formHandler.handleFormSubmit);
    }
    
    if (browseButton) {
        browseButton.addEventListener('click', window.formHandler.handleBrowseClick);
    }

    // Register Service Worker for PWA Offline Capabilities
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    console.log('Service Worker registered successfully with scope:', reg.scope);
                })
                .catch(err => {
                    console.error('Service Worker registration failed:', err);
                });
        });
    }
});
