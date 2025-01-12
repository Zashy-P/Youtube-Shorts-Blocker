document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('shortsToggle');

    // Initialize the toggle based on the current state
    chrome.storage.sync.get(['shortsBlocked'], (result) => {
        toggle.checked = result.shortsBlocked || false;
    });

    toggle.addEventListener('change', (event) => {
        const isEnabled = event.target.checked;
        chrome.storage.sync.set({ shortsBlocked: isEnabled }, () => {
            if (isEnabled) {
                chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['content.js']
                        });
                    });
                });
            } else {
                chrome.tabs.query({ active: true, currentWindow: true, url: "*://*.youtube.com/*" }, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.reload(tab.id);
                    });
                });
            }
        });
    });
});

