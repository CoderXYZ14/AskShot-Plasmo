chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "take-screenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      chrome.storage.local.set({ screenshot: dataUrl }, () => {
        chrome.runtime.sendMessage({
          action: "screenshot-captured",
          data: dataUrl
        })
      })
    })
  }
})

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "get-screenshot") {
//     chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
//       sendResponse(dataUrl)
//     })
//     return true // Keep message channel open
//   }
// })
