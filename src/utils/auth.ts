export interface AuthSession {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  accessToken?: string
  expires?: string
}

let currentSession: AuthSession | null = null

export const signIn = async (): Promise<AuthSession | null> => {
  return new Promise((resolve) => {
    const authUrl = "http://localhost:3000/auth/signin?prompt=select_account"
    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const authWindow = window.open(
      authUrl,
      "Auth",
      `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`
    )

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== authWindow) return
      if (event.data?.type === "AUTH_SUCCESS") {
        window.removeEventListener("message", handleMessage)
        const session = event.data.session as AuthSession
        storeSession(session)
        resolve(session)
      }
    }

    window.addEventListener("message", handleMessage)

    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed)
        window.removeEventListener("message", handleMessage)
        resolve(null)
      }
    }, 500)
  })
}

export const signOut = async (): Promise<void> => {
  await chrome.storage.local.remove(["auth_session"])
  currentSession = null

  const width = 600
  const height = 700
  const left = window.screen.width / 2 - width / 2
  const top = window.screen.height / 2 - height / 2

  const signOutWindow = window.open(
    "http://localhost:3000/api/auth/signout?callbackUrl=/auth/signin?prompt=select_account",
    "SignOut",
    `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`
  )

  setTimeout(() => {
    signOutWindow?.close()
  }, 2000)
}

export const storeSession = async (session: AuthSession): Promise<void> => {
  currentSession = session
  await chrome.storage.local.set({ auth_session: JSON.stringify(session) })
}

export const loadSession = async (): Promise<AuthSession | null> => {
  if (currentSession) return currentSession

  return new Promise((resolve) => {
    chrome.storage.local.get(["auth_session"], (result) => {
      if (result.auth_session) {
        try {
          const session = JSON.parse(result.auth_session) as AuthSession
          currentSession = session
          resolve(session)
        } catch (e) {
          console.error("AuthSession | Failed to parse stored session:", e)
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })
}

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await loadSession()
  return !!session
}

export const getCurrentUser = async () => {
  const session = await loadSession()
  return session?.user || null
}
