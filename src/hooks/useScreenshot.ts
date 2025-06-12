import { useEffect, useState } from "react"

export const useScreenshot = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null)

  useEffect(() => {
    chrome.storage.local.get(["screenshot"], (result) => {
      if (result.screenshot) setScreenshot(result.screenshot)
    })

    const listener = (message: any) => {
      if (message.action === "screenshot-captured" && message.data) {
        console.log("useScreenshot | Screenshot received")
        setScreenshot(message.data)
      }
    }

    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  const clearScreenshot = () => {
    setScreenshot(null)
    chrome.storage.local.remove(["screenshot"], () => {
      console.log("useScreenshot | Screenshot cleared from storage")
    })
  }

  return { screenshot, setScreenshot, clearScreenshot }
}
