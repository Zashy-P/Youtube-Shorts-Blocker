chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['shortsBlocked'], (result) => {
        if (result.shortsBlocked === undefined) {
            chrome.storage.sync.set({ shortsBlocked: false }, () => {
                console.log("Initialized 'shortsBlocked' to false.");
            });
        }
    });
});

// Listen for changes in the 'shortsBlocked' state
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.shortsBlocked) {
        const isEnabled = changes.shortsBlocked.newValue;
        
        if (isEnabled) {
            // Inject content.js into all YouTube tabs
            chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                });
            });
        } else {
            // Reload only the active YouTube tab
            chrome.tabs.query({ active: true, currentWindow: true, url: "*://*.youtube.com/*" }, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.reload(tab.id);
                });
            });
        }
    }
});

// Listen for new or updated YouTube tabs and inject content.js if shortsBlocked is true
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes("youtube.com")) {
        chrome.storage.sync.get(['shortsBlocked'], (result) => {
            if (result.shortsBlocked) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
            }
        });
    }
});

// Listen for tab activation to check the shortsBlocked state
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && tab.url.includes("youtube.com")) {
            chrome.storage.sync.get(['shortsBlocked'], (result) => {
                if (!result.shortsBlocked) {
                    // Inject a script to check for Shorts elements
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            // Check for Shorts elements
                            return !!document.querySelector('div#rich-shelf-header.style-scope.ytd-rich-shelf-renderer');
                        }
                    }, (injectionResults) => {
                        if (injectionResults && injectionResults[0].result === false) {
                            // Reload the tab if Shorts elements are not present
                            chrome.tabs.reload(tab.id);
                        }
                    });
                }
            });
        }
    });
});