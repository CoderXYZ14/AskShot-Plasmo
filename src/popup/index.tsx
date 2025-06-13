import { useEffect, useState } from "react"

import { analyzeScreenshot, getScreenshotQuestions } from "../utils/api"

import "../styles/global.css"

import {
  AuthScreen,
  CaptureScreen,
  ChatHeader,
  ChatInput,
  ChatMessages,
  ScreenshotDisplay,
  ScreenshotHistory
} from "~components"
import { useDrawing, useScreenshot } from "~hooks"

interface Message {
  sender: "ai" | "user"
  text: string
}

interface ScreenshotData {
  id?: string
  dataUrl: string
}

const IndexPopup = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Hi! Ask me anything about the image." }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [screenshotData, setScreenshotData] = useState<ScreenshotData | null>(
    null
  )
  const [showHistory, setShowHistory] = useState(false)

  const { screenshot, clearScreenshot, setScreenshot } = useScreenshot()
  const { startDrawing } = useDrawing()

  // Load screenshot and conversation history from storage when component mounts
  useEffect(() => {
    chrome.storage.local.get(["screenshot", "screenshotId"], (result) => {
      if (result.screenshot) {
        if (result.screenshotId) {
          setScreenshotData({
            id: result.screenshotId,
            dataUrl: result.screenshot
          })

          // Load conversation history for this screenshot
          loadConversationHistory(result.screenshotId)
        }
      }
    })
  }, [])

  const handleSend = async () => {
    if (!input.trim() || !screenshot) return

    const userQuestion = input.trim()
    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }])
    setInput("")
    setLoading(true)

    try {
      // Pass the screenshot ID if available
      const response = await analyzeScreenshot(
        screenshot,
        userQuestion,
        screenshotData?.id
      )
      setMessages((prev) => [...prev, { sender: "ai", text: response.answer }])

      // Store the screenshotId if it's the first question for this screenshot
      if (response.screenshotId && (!screenshotData || !screenshotData.id)) {
        const newScreenshotData = {
          id: response.screenshotId,
          dataUrl: screenshot
        }
        setScreenshotData(newScreenshotData)

        // Save screenshot ID to storage for persistence
        chrome.storage.local.set(
          {
            screenshot: screenshot,
            screenshotId: response.screenshotId
          },
          () => {
            console.log("IndexPopup | Screenshot ID saved to storage")
          }
        )
      } else if (screenshotData && screenshotData.id) {
        // If we already have a screenshot ID, we don't need to do anything special
        // The API will associate the question with the existing screenshot
        // The next time this screenshot is loaded, the conversation history will include this question
        console.log(
          "IndexPopup | Using existing screenshot ID:",
          screenshotData.id
        )
      }
    } catch (error) {
      console.error("IndexPopup | Error getting AI response:", error)
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I couldn't analyze that screenshot. Please try again."
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAuthChange = (isAuth: boolean) => {
    setIsAuthenticated(isAuth)
    console.log("IndexPopup | Authentication status changed:", isAuth)
  }

  const handleClearScreenshot = () => {
    clearScreenshot()
    setScreenshotData(null)
    setMessages([
      { sender: "ai", text: "Hi! Ask me anything about the image." }
    ])
    setShowHistory(false)

    // Clear screenshot data from storage
    chrome.storage.local.remove(["screenshot", "screenshotId"], () => {
      console.log("IndexPopup | Screenshot data cleared from storage")
    })
  }

  const handleSelectFromHistory = (imageUrl: string, screenshotId: string) => {
    setScreenshot(imageUrl)
    setShowHistory(false)
    setScreenshotData({
      id: screenshotId,
      dataUrl: imageUrl
    })

    // Load conversation history for this screenshot
    loadConversationHistory(screenshotId)
  }

  const loadConversationHistory = async (screenshotId: string) => {
    try {
      setLoading(true)
      const data = await getScreenshotQuestions(screenshotId)

      if (data.questions && data.questions.length > 0) {
        // Convert questions and answers to message format
        const conversationMessages: Message[] = []

        // Add initial AI greeting
        conversationMessages.push({
          sender: "ai",
          text: "Hi! Ask me anything about this image from your history."
        })

        // Add all questions and answers in chronological order
        data.questions.forEach((q) => {
          conversationMessages.push({ sender: "user", text: q.question })
          conversationMessages.push({ sender: "ai", text: q.answer })
        })

        setMessages(conversationMessages)
      } else {
        // No conversation history, set default greeting
        setMessages([
          {
            sender: "ai",
            text: "Hi! Ask me anything about this image from your history."
          }
        ])
      }
    } catch (error) {
      console.error("Error loading conversation history:", error)
      setMessages([
        {
          sender: "ai",
          text: "Hi! Ask me anything about this image from your history."
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthChange={handleAuthChange} />
  }

  if (showHistory) {
    return (
      <div className="w-[400px] h-[600px] bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.17)] backdrop-blur-xl flex flex-col overflow-hidden border border-white/40">
        <div className="absolute inset-0 bg-white z-10">
          <ScreenshotHistory 
            onSelectScreenshot={handleSelectFromHistory} 
            onClose={() => setShowHistory(false)} 
          />
        </div>
      </div>
    )
  }

  if (!screenshot) {
    return (
      <CaptureScreen
        onStartDrawing={startDrawing}
        onAuthChange={handleAuthChange}
      />
    )
  }

  return (
    <div className="w-[400px] h-[600px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.17)] backdrop-blur-xl flex flex-col overflow-hidden border border-white/40">
      <ChatHeader
        screenshot={screenshot}
        onStartDrawing={startDrawing}
        onAuthChange={handleAuthChange}
      />
      <ScreenshotDisplay
        screenshot={screenshot}
        onClear={handleClearScreenshot}
      />
      <div className="flex justify-end px-3 mb-1">
        <button
          onClick={() => setShowHistory(true)}
          className="text-xs text-blue-600 hover:text-blue-800">
          View History
        </button>
      </div>
      <ChatMessages messages={messages} loading={loading} />
      <ChatInput input={input} onInputChange={setInput} onSend={handleSend} />
    </div>
  )
}

export default IndexPopup
