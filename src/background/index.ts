chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "get-screenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse(dataUrl)
    })
    return true // keep the message channel open
  }
})

async function captureAndCropScreenshot(selection: {
  x: number
  y: number
  width: number
  height: number
}): Promise<string> {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) throw new Error("No active tab")

    // First capture the full visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
      quality: 100
    })

    console.log("Full screenshot captured, cropping to:", selection)

    // Then crop it to the selected area
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = selection.width
          canvas.height = selection.height
          const ctx = canvas.getContext("2d")!

          ctx.drawImage(
            img,
            selection.x,
            selection.y,
            selection.width,
            selection.height,
            0,
            0,
            selection.width,
            selection.height
          )

          const croppedDataUrl = canvas.toDataURL("image/png")
          console.log("Cropped screenshot created")
          resolve(croppedDataUrl)
        } catch (error) {
          console.error("Canvas cropping error:", error)
          reject(error)
        }
      }
      img.onerror = () => {
        console.error("Image load error")
        reject(new Error("Failed to load screenshot"))
      }
      img.src = dataUrl
    })
  } catch (error) {
    console.error("Capture error:", error)
    throw error
  }
}
