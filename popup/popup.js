chrome.tabs.querry({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getProductInfo"}, function(response) {
        if(response && response.productName) {
            document.getElementById("priceInfo").innerText = `Product: ${response.productName} \nChecking Prices...`;
        }else {
            document.getElementById("priceInfo").innerText = "No product page or can't extracted info.";
        }
    });
});