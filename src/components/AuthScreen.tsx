import { AuthButton } from "./AuthButton"

interface AuthScreenProps {
  onAuthChange: (isAuth: boolean) => void
}

export const AuthScreen = ({ onAuthChange }: AuthScreenProps) => (
  <div className="w-[280px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden border border-white/40">
    <div className="p-4 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center py-2 gap-4">
        <div className="text-center">
          <h2 className="text-lg font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">
            AskShot
          </h2>
          <p className="text-sm text-gray-500/80">Please login to continue</p>
        </div>
        <AuthButton onAuthChange={onAuthChange} />
      </div>
    </div>
  </div>
)
