import { X } from "lucide-react"

interface ScreenshotDisplayProps {
  screenshot: string | null
  onClear: () => void
}

export const ScreenshotDisplay = ({
  screenshot,
  onClear
}: ScreenshotDisplayProps) => (
  <div className="relative h-48 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-violet-300 animate-gradient p-4 flex flex-col items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent backdrop-blur-[2px]" />

    {screenshot && (
      <button
        onClick={onClear}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/70 hover:bg-white/90 shadow-md transition-all duration-200 border border-white/40 z-10"
        title="Clear screenshot">
        <X size={16} className="text-red-500" />
      </button>
    )}

    <div className="relative w-full max-w-[280px] aspect-video bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center border border-white/40 transition-transform hover:scale-[1.02] cursor-pointer">
      {screenshot ? (
        <img
          src={screenshot}
          alt="Screenshot"
          className="w-full h-full object-contain rounded-2xl"
          onError={(e) => {
            console.error("ScreenshotDisplay | Image failed to load")
            e.currentTarget.style.display = "none"
          }}
        />
      ) : (
        <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-medium">
          Screenshot will appear here
        </span>
      )}
    </div>
  </div>
)
