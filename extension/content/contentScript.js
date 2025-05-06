// Content script for Price Demon extension
console.log("Price Demon content script loaded");

// Functions to extract product titles from different e-commerce sites
function getAmazonTitle() {
    const selectors = [
        "#productTitle",
        "#title",
        ".a-size-large.product-title-word-break",
        ".product-title-word-break"
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText.trim()) {
            return element.innerText.trim();
        }
    }
    
    // Try to get from page title as fallback
    if (document.title && document.title.includes(':')) {
        return document.title.split(':')[0].trim();
    }
    
    return null;
}

function getFlipcartTitle() {
    const selectors = [
        "span.B_NuCI", 
        "h1.yhB1nd", 
        ".G6XhRU", 
        ".B_NuCI",
        "._30jeq3"
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText.trim()) {
            return element.innerText.trim();
        }
    }
    
    // If all else fails, try to get the page title
    const pageTitle = document.title.replace(" - Buy Online at Best Price in India | Flipkart.com", "");
    if (pageTitle) return pageTitle;
    
    return null;
}

function getMyntraTitle() {
    const selectors = [
        "h1.pdp-title",
        "h1.pdp-name",
        ".pdp-product-title",
        ".pdp-name"
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText.trim()) {
            return element.innerText.trim();
        }
    }
    
    // Try to get from page title as fallback
    if (document.title && document.title.includes('-')) {
        return document.title.split('-')[0].trim();
    }
    
    return null;
}

// Function to extract detailed product information
function getProductDetails() {
    const hostname = window.location.hostname;
    let productInfo = {
        name: null,
        brand: null,
        model: null,
        storage: null,
        color: null,
        category: null
    };
    
    // Extract product name based on the site
    if (hostname.includes("flipkart.com")) {
        productInfo.name = getFlipcartTitle();
        
        // Try to extract brand
        const brandKeywords = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Redmi", "OPPO", "Vivo", "Realme", "Nokia", "Sony", "LG", "Motorola", "Google"];
        for (const brand of brandKeywords) {
            if (productInfo.name?.includes(brand)) {
                productInfo.brand = brand;
                break;
            }
        }
        
        // Extract model (e.g., iPhone 16e, Galaxy S24)
        const modelPatterns = [
            /(iPhone \d+e?)/i,
            /(Galaxy S\d+)/i,
            /(OnePlus \d+)/i,
            /(Pixel \d+)/i,
            /(Redmi Note \d+)/i,
            /(Redmi \d+)/i
        ];
        
        for (const pattern of modelPatterns) {
            const match = productInfo.name?.match(pattern);
            if (match) {
                productInfo.model = match[0];
                break;
            }
        }
        
        // Extract storage (e.g., 128 GB)
        const storageMatch = productInfo.name?.match(/(\d+)\s*GB/i);
        if (storageMatch) productInfo.storage = storageMatch[0];
        
        // Extract color
        const colorMatch = productInfo.name?.match(/\((.*?)\)/);
        if (colorMatch) {
            const colorPart = colorMatch[1];
            if (!colorPart.includes("GB")) {
                productInfo.color = colorPart;
            }
        }
        
        // If no color found in parentheses, try common color names
        if (!productInfo.color) {
            const colorKeywords = ["Black", "White", "Blue", "Red", "Green", "Gold", "Silver", "Gray", "Purple", "Yellow"];
            for (const color of colorKeywords) {
                if (productInfo.name?.includes(color)) {
                    productInfo.color = color;
                    break;
                }
            }
        }
        
        console.log("Extracted product details from Flipkart:", productInfo);
    } 
    else if (hostname.includes("amazon.in")) {
        productInfo.name = getAmazonTitle();
        
        // Try to extract brand
        const brandElement = document.querySelector("#bylineInfo");
        if (brandElement) {
            const brandText = brandElement.innerText.trim();
            const brandMatch = brandText.match(/Visit the (.*?) Store|Brand: (.*)/i);
            if (brandMatch) {
                productInfo.brand = (brandMatch[1] || brandMatch[2]).trim();
            }
        }
        
        // If no brand found, try common brands
        if (!productInfo.brand) {
            const brandKeywords = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Redmi", "OPPO", "Vivo", "Realme", "Nokia", "Sony", "LG", "Motorola", "Google"];
            for (const brand of brandKeywords) {
                if (productInfo.name?.includes(brand)) {
                    productInfo.brand = brand;
                    break;
                }
            }
        }
        
        // Extract model
        const modelPatterns = [
            /(iPhone \d+e?)/i,
            /(Galaxy S\d+)/i,
            /(OnePlus \d+)/i,
            /(Pixel \d+)/i,
            /(Redmi Note \d+)/i,
            /(Redmi \d+)/i
        ];
        
        for (const pattern of modelPatterns) {
            const match = productInfo.name?.match(pattern);
            if (match) {
                productInfo.model = match[0];
                break;
            }
        }
        
        // Extract storage
        const storageMatch = productInfo.name?.match(/(\d+)\s*GB/i);
        if (storageMatch) productInfo.storage = storageMatch[0];
        
        // Extract color
        const colorKeywords = ["Black", "White", "Blue", "Red", "Green", "Gold", "Silver", "Gray", "Purple", "Yellow"];
        for (const color of colorKeywords) {
            if (productInfo.name?.includes(color)) {
                productInfo.color = color;
                break;
            }
        }
        
        console.log("Extracted product details from Amazon:", productInfo);
    }
    else if (hostname.includes("myntra.com")) {
        productInfo.name = getMyntraTitle();
        
        // Extract brand and other details similar to above
        // ...
    }
    
    return productInfo;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received in content script:", request);
    
    if (request.action === "getProductInfo") {
        const hostname = window.location.hostname;
        let productName = null;
        
        if (hostname.includes("amazon.in")) productName = getAmazonTitle();
        else if (hostname.includes("flipkart.com")) productName = getFlipcartTitle();
        else if (hostname.includes("myntra.com")) productName = getMyntraTitle();
        
        // Get detailed product information
        const productDetails = getProductDetails();
        
        console.log("Detected product name:", productName);
        console.log("Detected product details:", productDetails);
        
        // Create a search-friendly query
        let searchQuery = productName;
        if (productDetails.brand && productDetails.model) {
            // Create a more specific but generic search query
            const queryParts = [];
            if (productDetails.brand) queryParts.push(productDetails.brand);
            if (productDetails.model) queryParts.push(productDetails.model);
            if (productDetails.storage) queryParts.push(productDetails.storage);
            
            // Only add color if it's likely important for the product
            if (productDetails.color && (productName.includes(productDetails.color) || productName.includes("color"))) {
                queryParts.push(productDetails.color);
            }
            
            if (queryParts.length > 0) {
                searchQuery = queryParts.join(' ');
            }
        }
        
        console.log("Generated search query:", searchQuery);
        
        sendResponse({
            productName: productName,
            productDetails: productDetails,
            searchQuery: searchQuery
        });
    }
    
    return true; // Keep the message channel open for async response
});
  