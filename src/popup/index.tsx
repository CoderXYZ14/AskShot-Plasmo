import { Edit2, Send, X } from "lucide-react"
import { useEffect, useState } from "react"

import "../styles/global.css"

const IndexPopup = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! Ask me anything about the image." },
    { sender: "user", text: "What's the issue in this section?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Load screenshot if exists
  useEffect(() => {
    chrome.storage.local.get(["screenshot"], (result) => {
      if (result.screenshot) setScreenshot(result.screenshot)
    })
  }, [])

  // Listen for messages from content script
  useEffect(() => {
    const listener = (message: any) => {
      if (message.action === "screenshot-captured" && message.data) {
        setScreenshot(message.data)
        setIsDrawing(false)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  const startDrawing = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id)
        chrome.tabs.sendMessage(tabs[0].id, { action: "start-drawing" })
      setIsDrawing(true)
    })
  }

  const cancelDrawing = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id)
        chrome.tabs.sendMessage(tabs[0].id, { action: "cancel-drawing" })
      setIsDrawing(false)
    })
  }

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { sender: "user", text: input }])
    setInput("")
    setLoading(true)

    // simulate API call
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Here's a possible explanation..." }
      ])
      setLoading(false)
    }, 1500)
  }

  return isDrawing ? (
    // Minimal Drawing Mode UI
    <div className="w-[180px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden border border-white/40">
      <div className="p-3 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={cancelDrawing}
            className="relative p-2 rounded-xl text-white overflow-hidden transition-all hover:shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 transition-transform group-hover:scale-[1.1] duration-300" />
            <X size={16} className="relative" />
          </button>
          <div className="text-xs font-medium text-gray-500/70 px-2 py-1 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30">
            ESC to cancel
          </div>
        </div>
      </div>
    </div>
  ) : (
    // Main Chat UI
    <div className="w-[400px] h-[600px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.17)] backdrop-blur-xl flex flex-col overflow-hidden border border-white/40">
      {/* Drawing Toolbar */}
      <div className="p-3 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center gap-2">
          <button
            onClick={startDrawing}
            className="relative p-2.5 rounded-xl text-white overflow-hidden transition-all hover:shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-[1.1] duration-300" />
            <Edit2 size={18} className="relative" />
          </button>

          <div className="flex-1">
            {screenshot ? (
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Screenshot ready
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-500/70">
                Click pencil to capture screen
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Screenshot Preview */}
      <div className="relative h-48 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-violet-300 animate-gradient p-4 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent backdrop-blur-[2px]" />
        <div className="relative w-full max-w-[280px] aspect-video bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center border border-white/40 transition-transform hover:scale-[1.02] cursor-pointer">
          {screenshot ? (
            <img
              src={screenshot}
              alt="Screenshot"
              className="w-full h-full object-contain rounded-2xl"
            />
          ) : (
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-medium">
              Screenshot will appear here
            </span>
          )}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 bg-gradient-to-b from-white/40 to-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 text-sm backdrop-blur-sm animate-in slide-in-from-${msg.sender === "user" ? "right" : "left"} duration-300
                ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-violet-200"
                    : "bg-white/70 text-gray-700 rounded-2xl rounded-tl-sm shadow-lg shadow-violet-100/20 border border-white/40"
                }
              `}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 px-4 py-2 w-16 rounded-full bg-white/50 backdrop-blur-sm border border-white/40">
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
            <div
              className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-gradient-to-t from-white/60 to-transparent border-t border-white/20">
        <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-2xl px-3 py-1.5 focus-within:bg-white/70 focus-within:shadow-lg transition-all duration-300 border border-white/40">
          <input
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder-gray-500/70"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about the screenshot..."
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="relative ml-2 px-5 py-2 text-sm font-medium rounded-xl text-white overflow-hidden transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-[1.1] duration-300" />
            <span className="relative">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
