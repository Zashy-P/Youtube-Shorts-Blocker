let urlObserver;
let domObserver;

// Function to enable the Shorts blocker
function enableShortsBlocker() {
  console.log("Enabling Shorts Blocker");
  redirectIfShorts();
  removeShortsElements();
  removeShortsFromSidebar();
  removeShortsFromRecommended();

  // Monitor URL changes
  let lastUrl = location.href;
  urlObserver = new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
          lastUrl = url;
          redirectIfShorts();
          removeShortsElements();
          removeShortsFromSidebar();
          removeShortsFromRecommended();
      }
  });
  urlObserver.observe(document, { subtree: true, childList: true });

  // Monitor DOM changes for dynamically loaded elements
  domObserver = new MutationObserver(() => {
      removeShortsElements();
      removeShortsFromSidebar();
      removeShortsFromRecommended();
  });
  domObserver.observe(document, { subtree: true, childList: true });
}

// Function to disable the Shorts blocker
function disableShortsBlocker() {
  console.log("Disabling Shorts Blocker");
  if (urlObserver) urlObserver.disconnect();
  if (domObserver) domObserver.disconnect();
  window.location.reload();
}

// Function to redirect if the current page is a Shorts page
function redirectIfShorts() {
  console.log("Checking if current page is a Shorts page");
  if (window.location.href.includes("youtube.com/shorts")) {
      console.log("Redirecting from Shorts page");
      window.location.href = "https://www.youtube.com";
  }
}

// Function to remove Shorts elements from the main page
function removeShortsElements() {
  console.log("Removing Shorts elements from the main page");
  const shortsHeaders = document.querySelectorAll('div#dismissible.style-scope.ytd-rich-shelf-renderer');
  shortsHeaders.forEach(header => {
      const title = header.querySelector('span#title');
      if (title && title.textContent.trim() === 'Shorts') {
          console.log("Removing Shorts element:", header);
          header.remove();
      }
  });
}

// Function to remove Shorts from the sidebar
function removeShortsFromSidebar() {
  console.log("Removing Shorts from the sidebar");
  const sidebarShorts = document.querySelectorAll('tp-yt-paper-item.style-scope.ytd-guide-entry-renderer, a#endpoint.yt-simple-endpoint.style-scope.ytd-guide-entry-renderer');
  sidebarShorts.forEach(item => {
      const title = item.querySelector('yt-formatted-string.title');
      if (title && title.textContent.trim() === 'Shorts') {
          console.log("Removing Shorts sidebar item:", item);
          item.remove();
      }
  });
  const sidebarShortsLinks = document.querySelectorAll('a#endpoint.yt-simple-endpoint.style-scope.ytd-guide-entry-renderer[title="Shorts"]');
  sidebarShortsLinks.forEach(link => {
      console.log("Removing Shorts sidebar link:", link);
      link.remove();
  });
}

// Function to remove Shorts from the recommended section
function removeShortsFromRecommended() {
  console.log("Removing Shorts from the recommended section");
  const recommendedShorts = document.querySelectorAll('ytd-reel-shelf-renderer');
  console.log('Found recommended shorts:', recommendedShorts.length);
  recommendedShorts.forEach(item => {
      const title = item.querySelector('span#title');
      if (title && title.textContent.trim() === 'Shorts') {
          console.log('Removing recommended shorts:', item);
          item.remove();
      }
  });
}

// Function to immediately remove Shorts elements when the script is injected
(function() {
    chrome.storage.sync.get(['shortsBlocked'], (result) => {
        if (result.shortsBlocked) {
            enableShortsBlocker();
        }
    });
})();

