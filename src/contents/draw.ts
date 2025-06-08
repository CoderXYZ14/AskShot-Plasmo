let isDrawing = false
let startX = 0
let startY = 0
let rect: HTMLDivElement | null = null

document.addEventListener("message", (e: any) => {
  if (e?.data?.action === "cancel-drawing") {
    removeOverlay()
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start-drawing") {
    startDrawingOverlay()
    sendResponse({ status: "started" })
  }
})

const startDrawingOverlay = () => {
  console.log("🖌️ Drawing overlay activated")

  // Prevent multiple overlays
  if (document.getElementById("askshot-capture-canvas")) {
    return
  }

  const canvas = document.createElement("canvas")
  canvas.id = "askshot-capture-canvas"
  canvas.style.position = "fixed"
  canvas.style.top = "0"
  canvas.style.left = "0"
  canvas.style.width = "100vw"
  canvas.style.height = "100vh"
  canvas.style.zIndex = "9999999"
  canvas.style.cursor = "crosshair"
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const ctx = canvas.getContext("2d")!
  let startX = 0,
    startY = 0,
    isDrawing = false,
    rect = { x: 0, y: 0, width: 0, height: 0 }

  // Transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Mouse events
  canvas.onmousedown = (e) => {
    isDrawing = true
    startX = e.clientX
    startY = e.clientY
  }

  canvas.onmousemove = (e) => {
    if (!isDrawing) return
    const currentX = e.clientX
    const currentY = e.clientY

    rect.x = Math.min(startX, currentX)
    rect.y = Math.min(startY, currentY)
    rect.width = Math.abs(currentX - startX)
    rect.height = Math.abs(currentY - startY)

    // Redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.clearRect(rect.x, rect.y, rect.width, rect.height)
    ctx.strokeStyle = "#00f"
    ctx.lineWidth = 2
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
  }

  canvas.onmouseup = async () => {
    isDrawing = false

    if (rect.width < 10 || rect.height < 10) {
      console.log("Selection too small, cancelling")
      canvas.remove()
      return
    }

    // Save the rect dimensions before removing canvas
    const selectedRect = { ...rect }

    // Clean up canvas immediately for better UX
    canvas.remove()

    // Request screenshot and crop it
    chrome.runtime.sendMessage(
      {
        action: "capture-screenshot"
      },
      async (response) => {
        console.log("Received full screenshot from background")
        if (response && response.success && response.data) {
          try {
            // Crop the screenshot to the selected region
            const croppedImage = await cropImage(response.data, selectedRect)

            // Send the cropped image back to be stored
            chrome.runtime.sendMessage({
              action: "store-cropped-screenshot",
              data: croppedImage
            })

            console.log("Cropped screenshot sent for storage")
          } catch (error) {
            console.error("Error cropping screenshot:", error)
          }
        }
      }
    )
  }

  // Optional: Cancel on Esc
  document.onkeydown = (e) => {
    if (e.key === "Escape") {
      console.log("✖️ Drawing cancelled")
      canvas.remove()
    }
  }

  document.body.appendChild(canvas)
}

function removeOverlay() {
  const el =
    document.getElementById("your-overlay-id") ||
    document.querySelector("div[style*='999999']")
  el?.remove()
}

// Crop logic
async function cropImage(
  base64: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = new Image()
  img.src = base64
  await img.decode()

  const canvas = document.createElement("canvas")
  canvas.width = rect.width
  canvas.height = rect.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(
    img,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    rect.width,
    rect.height
  )
  return canvas.toDataURL("image/png")
}

function addCancelButton(overlay: HTMLDivElement) {
  const cancel = document.createElement("button")
  cancel.innerText = "Cancel"
  cancel.style.position = "fixed"
  cancel.style.top = "10px"
  cancel.style.right = "10px"
  cancel.style.zIndex = "10000000"
  cancel.style.padding = "8px"
  cancel.style.background = "#fff"
  cancel.style.border = "1px solid #333"
  cancel.onclick = () => removeOverlay()
  overlay.appendChild(cancel)
}
