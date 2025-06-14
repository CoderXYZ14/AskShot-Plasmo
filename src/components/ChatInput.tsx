interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export const ChatInput = ({
  input,
  onInputChange,
  onSend,
  disabled = false
}: ChatInputProps) => (
  <div className="p-4 bg-gradient-to-t from-white/60 to-transparent border-t border-white/20">
    <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-2xl px-3 py-1.5 focus-within:bg-white/70 focus-within:shadow-lg transition-all duration-300 border border-white/40">
      <input
        className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder-gray-500/70"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !disabled && onSend()}
        placeholder="Ask about the screenshot..."
        disabled={disabled}
      />
      <button
        onClick={onSend}
        disabled={!input.trim() || disabled}
        className="relative ml-2 px-5 py-2 text-sm font-medium rounded-xl text-white overflow-hidden transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-[1.1] duration-300" />
        <span className="relative">Send</span>
      </button>
    </div>
  </div>
)
