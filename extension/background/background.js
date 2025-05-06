// Background script for Price Demon extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("Price Demon installed!");
  
  // Set default options if needed
  chrome.storage.local.set({
    serverUrl: "http://localhost:3000",
    enableNotifications: true
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkPrices") {
    // This could be used for background price checking functionality
    fetchPrices(request.productName)
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

async function fetchPrices(query) {
  const response = await fetch(`http://localhost:3000/price?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
  return await response.json();
}
  