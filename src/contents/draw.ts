let isDrawing = false
let startX = 0
let startY = 0
let rect: HTMLDivElement | null = null

document.addEventListener("message", (e: any) => {
  if (e?.data?.action === "cancel-drawing") {
    removeOverlay()
  }
})

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "start-drawing") {
    startDrawing()
    sendResponse({ status: "started" })
  } else if (message.action === "cancel-drawing") {
    removeOverlay()
    sendResponse({ status: "cancelled" })
  }
})

function startDrawing() {
  const overlay = document.createElement("div")
  overlay.style.position = "fixed"
  overlay.style.top = "0"
  overlay.style.left = "0"
  overlay.style.width = "100vw"
  overlay.style.height = "100vh"
  overlay.style.zIndex = "999999"
  overlay.style.cursor = "crosshair"
  overlay.style.backgroundColor = "rgba(0,0,0,0.05)"
  document.body.appendChild(overlay)

  overlay.addEventListener("mousedown", (e) => {
    isDrawing = true
    startX = e.clientX
    startY = e.clientY

    rect = document.createElement("div")
    rect.style.position = "absolute"
    rect.style.border = "2px dashed #555"
    rect.style.background = "rgba(0,0,0,0.2)"
    rect.style.zIndex = "9999999"
    overlay.appendChild(rect)
  })

  overlay.addEventListener("mousemove", (e) => {
    if (!isDrawing || !rect) return
    const width = e.clientX - startX
    const height = e.clientY - startY
    rect.style.left = `${Math.min(startX, e.clientX)}px`
    rect.style.top = `${Math.min(startY, e.clientY)}px`
    rect.style.width = `${Math.abs(width)}px`
    rect.style.height = `${Math.abs(height)}px`
  })

  overlay.addEventListener("mouseup", async () => {
    isDrawing = false

    const bounds = rect?.getBoundingClientRect()
    if (bounds) {
      const tab = await chrome.runtime.sendMessage({ action: "get-screenshot" })
      const cropped = await cropImage(tab, bounds)
      chrome.storage.local.set({ screenshot: cropped })
      chrome.runtime.sendMessage({
        action: "screenshot-captured",
        data: cropped
      })
    }

    removeOverlay()
  })
}

function removeOverlay() {
  document.querySelectorAll("div").forEach((el) => {
    if (el.style.zIndex === "999999" || el.style.zIndex === "9999999") {
      el.remove()
    }
  })
}

// Crop logic
async function cropImage(base64: string, rect: DOMRect): Promise<string> {
  const img = new Image()
  img.src = base64
  await img.decode()

  const canvas = document.createElement("canvas")
  canvas.width = rect.width
  canvas.height = rect.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(
    img,
    rect.left,
    rect.top,
    rect.width,
    rect.height,
    0,
    0,
    rect.width,
    rect.height
  )
  return canvas.toDataURL("image/png")
}
