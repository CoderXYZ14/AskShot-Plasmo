// Define the session type
export interface AuthSession {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  accessToken?: string
  expires?: string
}

// Store for the current session
let currentSession: AuthSession | null = null

// Function to open the authentication window
export const signIn = async (): Promise<AuthSession | null> => {
  return new Promise((resolve) => {
    // URL to your Next.js app's sign-in page with prompt=select_account to force Google account selection
    const authUrl = "http://localhost:3000/auth/signin?prompt=select_account"

    // Open a popup window for authentication
    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const authWindow = window.open(
      authUrl,
      "Auth",
      `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`
    )

    // Function to handle messages from the auth window
    const handleMessage = (event: MessageEvent) => {
      // Make sure the message is from our auth window
      if (event.source !== authWindow) return

      // Check if this is an auth success message
      if (event.data && event.data.type === "AUTH_SUCCESS") {
        // Remove the event listener
        window.removeEventListener("message", handleMessage)

        // Store the session
        const session = event.data.session as AuthSession
        storeSession(session)

        // Resolve the promise with the session
        resolve(session)
      }
    }

    // Add event listener for messages
    window.addEventListener("message", handleMessage)

    // If the window is closed without authentication
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed)
        window.removeEventListener("message", handleMessage)
        resolve(null)
      }
    }, 500)
  })
}

// Function to sign out
export const signOut = async (): Promise<void> => {
  // Clear the session from storage
  await chrome.storage.local.remove(["auth_session"])
  currentSession = null

  // Open the Next.js sign-out endpoint to properly sign out from Google
  // Use a popup window for sign-out with parameters to force account selection on next login
  const width = 600
  const height = 700
  const left = window.screen.width / 2 - width / 2
  const top = window.screen.height / 2 - height / 2

  // Add callbackUrl with prompt=select_account to force Google to show account selection
  const signOutWindow = window.open(
    "http://localhost:3000/api/auth/signout?callbackUrl=/auth/signin?prompt=select_account",
    "SignOut",
    `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`
  )

  // Close the sign-out window after a short delay
  setTimeout(() => {
    signOutWindow?.close()
  }, 2000)
}

// Function to store the session
export const storeSession = async (session: AuthSession): Promise<void> => {
  currentSession = session
  await chrome.storage.local.set({ auth_session: JSON.stringify(session) })
}

// Function to load the session
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
          console.error("Failed to parse stored session:", e)
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })
}

// Function to check if the user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await loadSession()
  return !!session
}

// Function to get the current user
export const getCurrentUser = async () => {
  const session = await loadSession()
  return session?.user || null
}
