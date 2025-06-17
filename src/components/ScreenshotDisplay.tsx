import { X } from "lucide-react"

interface ScreenshotDisplayProps {
  screenshot: string | null
  onClear: () => void
}

export const ScreenshotDisplay = ({
  screenshot,
  onClear
}: ScreenshotDisplayProps) => (
  <div className="relative overflow-hidden">
    {screenshot && (
      <button
        onClick={onClear}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 z-10"
        title="Clear screenshot">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    )}

    <div className="w-full h-48 flex items-center justify-center">
      {screenshot ? (
        <img
          src={screenshot}
          alt="Screenshot"
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            console.error("ScreenshotDisplay | Image failed to load")
            e.currentTarget.style.display = "none"
          }}
        />
      ) : (
        <div className="text-gray-400 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Screenshot will appear here</span>
        </div>
      )}
    </div>
  </div>
)
