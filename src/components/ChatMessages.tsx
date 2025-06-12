interface Message {
  sender: "ai" | "user"
  text: string
}

interface ChatMessagesProps {
  messages: Message[]
  loading: boolean
}

export const ChatMessages = ({ messages, loading }: ChatMessagesProps) => (
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
            }`}>
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
)
