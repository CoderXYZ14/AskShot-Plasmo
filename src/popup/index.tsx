import { useState } from "react"

import { analyzeScreenshot } from "../utils/api"

import "../styles/global.css"

import {
  AuthScreen,
  CaptureScreen,
  ChatHeader,
  ChatInput,
  ChatMessages,
  ScreenshotDisplay
} from "~components"
import { useDrawing, useScreenshot } from "~hooks"

interface Message {
  sender: "ai" | "user"
  text: string
}

const IndexPopup = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Hi! Ask me anything about the image." }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const { screenshot, clearScreenshot } = useScreenshot()
  const { startDrawing } = useDrawing()

  const handleSend = async () => {
    if (!input.trim() || !screenshot) return

    const userQuestion = input.trim()
    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }])
    setInput("")
    setLoading(true)

    try {
      const response = await analyzeScreenshot(screenshot, userQuestion)
      setMessages((prev) => [...prev, { sender: "ai", text: response.answer }])
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

  if (!isAuthenticated) {
    return <AuthScreen onAuthChange={handleAuthChange} />
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
      <ScreenshotDisplay screenshot={screenshot} onClear={clearScreenshot} />
      <ChatMessages messages={messages} loading={loading} />
      <ChatInput input={input} onInputChange={setInput} onSend={handleSend} />
    </div>
  )
}

export default IndexPopup
