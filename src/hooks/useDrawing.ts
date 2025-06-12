import { useState } from "react"

export const useDrawing = () => {
  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = async () => {
    try {
      console.log("useDrawing | Starting drawing mode")

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tab.id) {
        console.error("useDrawing | No active tab found")
        return
      }

      const sendMessage = async () => {
        const response = await chrome.tabs.sendMessage(tab.id!, {
          action: "start-drawing"
        })
        if (response?.status === "started") {
          setIsDrawing(true)
          window.close()
        }
      }

      try {
        await sendMessage()
      } catch {
        console.log("useDrawing | Injecting script")
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["/contents/draw.js"]
        })
        setTimeout(sendMessage, 100)
      }
    } catch (error) {
      console.error("useDrawing | Drawing initialization failed:", error)
      setIsDrawing(false)
    }
  }

  return { isDrawing, setIsDrawing, startDrawing }
}
