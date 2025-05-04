function getAmazonTitle(){
    return document.querySelector("#productTitle")?.innerText.trim();
}

function getFlipcartTitle(){
    return document.querySelector("span.B_NuCI")?.innerText.trim();
}

function getMyntraTitle(){
    return document.querySelector("h1.pdp-title")?.innerText.trim();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProductInfo") {
      const hostname = window.location.hostname;
      let productName = null;
  
      if (hostname.includes("amazon")) productName = getAmazonTitle();
      else if (hostname.includes("flipkart")) productName = getFlipkartTitle();
      else if (hostname.includes("myntra")) productName = getMyntraTitle();
  
      sendResponse({ productName });
    }
  });