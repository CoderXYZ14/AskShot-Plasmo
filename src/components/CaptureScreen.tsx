import { Edit2 } from "lucide-react"

import { AuthButton } from "../components/AuthButton"

interface CaptureScreenProps {
  onStartDrawing: () => void
  onAuthChange: (isAuth: boolean) => void
}

export const CaptureScreen = ({
  onStartDrawing,
  onAuthChange
}: CaptureScreenProps) => (
  <div className="w-[280px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden border border-white/40">
    <div className="p-4 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center py-2 gap-4">
        <div className="text-center">
          <h2 className="text-lg font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">
            AskShot
          </h2>
          <p className="text-sm text-gray-500/80">
            Capture and analyze screenshots
          </p>
        </div>

        <button
          onClick={onStartDrawing}
          className="relative p-4 rounded-full text-white overflow-hidden transition-all hover:shadow-lg group w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-[1.05] duration-300" />
          <Edit2 size={24} className="relative" />
        </button>

        <div className="text-sm font-medium text-gray-600/80 bg-white/50 px-4 py-2 rounded-xl border border-white/40 shadow-sm">
          Click pencil to capture screen
        </div>

        <AuthButton onAuthChange={onAuthChange} />
      </div>
    </div>
  </div>
)
