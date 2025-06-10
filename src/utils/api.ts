import axios from 'axios';

// The base URL for the API
// In development, this would be the local Next.js server
// In production, this should be your deployed API URL
const API_BASE_URL = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Ensures the image data is properly formatted as a base64 string
 * @param imageData - The image data to validate and format
 * @returns Properly formatted base64 image data
 */
function ensureValidImageData(imageData: string): string {
  if (!imageData) {
    throw new Error('No image data provided');
  }

  // If it's already a data URL, return it as is
  if (imageData.startsWith('data:image/')) {
    return imageData;
  }

  // If it's a raw base64 string, add the data URL prefix
  try {
    // Test if it's valid base64
    atob(imageData);
    return `data:image/png;base64,${imageData}`;
  } catch (e) {
    console.error('Invalid base64 image data:', e);
    throw new Error('Invalid image data format');
  }
}

/**
 * Send a screenshot and question to the Anthropic Claude Vision API
 * @param screenshot - Base64 encoded image data
 * @param question - User's question about the screenshot
 * @returns The AI's response
 */
export async function analyzeScreenshot(screenshot: string, question: string) {
  try {
    // Ensure the screenshot is valid base64 data
    const validatedScreenshot = ensureValidImageData(screenshot);
    
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
      screenshot: validatedScreenshot,
      question
    });
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing screenshot:', error);
    throw error;
  }
}
