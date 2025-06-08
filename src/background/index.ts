chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle full screenshot capture request
  if (message.action === "capture-screenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      // Send response back to the content script that requested it
      if (sendResponse) {
        sendResponse({ success: true, data: dataUrl })
      }
    })
    return true // Keep the message channel open for async response
  }

  // Handle storing the cropped screenshot
  if (message.action === "store-cropped-screenshot" && message.data) {
    // Store the cropped screenshot in local storage
    chrome.storage.local.set({ screenshot: message.data }, () => {
      // Send message to popup and any other listeners
      chrome.runtime.sendMessage({
        action: "screenshot-captured",
        data: message.data
      })

      console.log("Cropped screenshot stored and notified")
    })
  }
})
