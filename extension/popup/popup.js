document.addEventListener('DOMContentLoaded', function() {
  // Display initial loading message
  document.getElementById("priceInfo").innerText = "Connecting to page...";
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    // Check if we're on a supported site
    const supportedSites = ["amazon.in", "flipkart.com", "myntra.com"];
    const isSupported = supportedSites.some(site => currentTab.url.includes(site));
    
    if (!isSupported) {
      document.getElementById("priceInfo").innerText = 
        "Please navigate to Amazon.in, Flipkart, or Myntra product page.";
      return;
    }
    
    // Try to get product info from content script
    try {
      chrome.tabs.sendMessage(currentTab.id, { action: "getProductInfo"}, function(response) {
        console.log("Response from content script:", response);
        
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          document.getElementById("priceInfo").innerText = 
            "Error connecting to page. Please refresh the page and try again.";
          return;
        }
        
        // Update the part where you handle the response from content script
        if(response && response.productName) {
            document.getElementById("priceInfo").innerText = `Product: ${response.productName}\nChecking Prices...`;
            
            // Use product details if available for more accurate search
            let searchQuery = response.productName;
            if (response.productDetails && response.productDetails.model) {
                // Create a more specific search query using the extracted details
                const details = response.productDetails;
                searchQuery = [
                    details.model,
                    details.storage,
                    details.color
                ].filter(Boolean).join(' ');
                
                console.log("Using enhanced search query:", searchQuery);
            }
            
            // Fetch prices from our backend
            fetch(`http://localhost:3000/price?q=${encodeURIComponent(searchQuery)}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Data from server:", data);
                    displayResults(data);
                })
                .catch(error => {
                    document.getElementById("results").innerHTML = 
                        `<p class="error">Error fetching prices: ${error.message}</p>`;
                });
        } else {
            document.getElementById("priceInfo").innerText = "No product detected or can't extract info.";
        }
      });
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("priceInfo").innerText = 
        "Error connecting to page. Please refresh the page and try again.";
    }
  });
});

function displayResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  
  const sites = ["amazon", "flipkart", "myntra"];
  let lowestPrice = Infinity;
  let lowestSite = "";
  
  sites.forEach(site => {
    if (data[site] && data[site].price) {
      // Extract numeric price (remove currency symbols, commas, etc.)
      const priceText = data[site].price.replace(/[^\d.]/g, "");
      const price = parseFloat(priceText);
      
      if (price && price < lowestPrice) {
        lowestPrice = price;
        lowestSite = data[site].site;
      }
    }
  });
  
  // Create result elements
  sites.forEach(site => {
    if (data[site] && data[site].title) {
      const siteDiv = document.createElement("div");
      siteDiv.className = "site-result";
      
      const isLowest = data[site].site === lowestSite;
      
      siteDiv.innerHTML = `
        <h3>${data[site].site} ${isLowest ? '(Best Price!)' : ''}</h3>
        <p class="product-title">${data[site].title}</p>
        <p class="product-price ${isLowest ? 'lowest-price' : ''}">${data[site].price}</p>
      `;
      
      resultsDiv.appendChild(siteDiv);
    }
  });
}

// When you have a product name
function fetchPrices(productName) {
  fetch(`http://localhost:3000/price?q=${encodeURIComponent(productName)}`)
    .then(response => response.json())
    .then(data => {
      // Process the price data
      displayPrices(data);
    })
    .catch(error => {
      console.error("Error fetching prices:", error);
      document.getElementById("priceInfo").textContent = "Error fetching prices. Make sure the server is running.";
    });
}

function displayPrices(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  
  // Display each site's results
  if (data.amazon && data.amazon.title) {
    resultsDiv.innerHTML += `
      <div class="site-result">
        <h3>Amazon</h3>
        <p>${data.amazon.title}</p>
        <p class="price">${data.amazon.price}</p>
      </div>
    `;
  }
  
  if (data.flipkart && data.flipkart.title) {
    resultsDiv.innerHTML += `
      <div class="site-result">
        <h3>Flipkart</h3>
        <p>${data.flipkart.title}</p>
        <p class="price">${data.flipkart.price}</p>
      </div>
    `;
  }
  
  if (data.myntra && data.myntra.title) {
    resultsDiv.innerHTML += `
      <div class="site-result">
        <h3>Myntra</h3>
        <p>${data.myntra.title}</p>
        <p class="price">${data.myntra.price}</p>
      </div>
    `;
  }
}
  