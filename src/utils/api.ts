import axios from "axios"

const API_BASE_URL =
  process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"

function ensureValidImageData(imageData: string): string {
  if (!imageData) throw new Error("No image data provided")

  if (imageData.startsWith("data:image/")) return imageData

  try {
    atob(imageData)
    return `data:image/png;base64,${imageData}`
  } catch (e) {
    console.error("AnalyzeScreenshot | Invalid base64:", e)
    throw new Error("Invalid image data format")
  }
}

export async function analyzeScreenshot(screenshot: string, question: string) {
  try {
    const validatedScreenshot = ensureValidImageData(screenshot)

    const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
      screenshot: validatedScreenshot,
      question
    })

    return response.data
  } catch (error) {
    console.error("AnalyzeScreenshot | Error:", error)
    throw error
  }
}
