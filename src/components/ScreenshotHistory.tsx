import { useEffect, useState } from "react"

import { getScreenshotQuestions, getScreenshots } from "~utils/api"

interface Screenshot {
  _id: string
  imageUrl: string
  createdAt: string
}

interface Question {
  _id: string
  question: string
  answer: string
  createdAt: string
}

interface ScreenshotHistoryProps {
  onSelectScreenshot: (imageUrl: string, screenshotId: string) => void
  onClose: () => void
}

export const ScreenshotHistory = ({
  onSelectScreenshot,
  onClose
}: ScreenshotHistoryProps) => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
    null
  )
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadScreenshots()
  }, [])

  useEffect(() => {
    if (selectedScreenshot) {
      setQuestions([])
      loadQuestions(selectedScreenshot)
    }
  }, [selectedScreenshot])

  const loadScreenshots = async () => {
    try {
      setLoading(true)
      const data = await getScreenshots()
      setScreenshots(data)
      if (data.length > 0) {
        setSelectedScreenshot(data[0]._id)
      }
    } catch (error) {
      console.error("Error loading screenshots:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuestions = async (screenshotId: string) => {
    try {
      setLoading(true)
      const data = await getScreenshotQuestions(screenshotId)
      setQuestions(data.questions)
    } catch (error) {
      console.error("Error loading questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectScreenshot = (screenshot: Screenshot) => {
    setSelectedScreenshot(screenshot._id)
    onSelectScreenshot(screenshot.imageUrl, screenshot._id)
  }

  if (loading && screenshots.length === 0) {
    return <div className="p-4 text-center">Loading history...</div>
  }

  if (screenshots.length === 0) {
    return <div className="p-4 text-center">No screenshots found</div>
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex justify-between items-center p-4 border-b border-white/40 bg-white/80 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-indigo-900">
          Screenshot History
        </h2>
        <button
          onClick={onClose}
          className="text-indigo-600 hover:text-indigo-800 transition-colors">
          Close
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-white/40 overflow-y-auto bg-white/30 backdrop-blur-sm">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot._id}
              className={`m-2 cursor-pointer rounded-lg shadow-sm transition-all hover:shadow-md ${
                selectedScreenshot === screenshot._id
                  ? "ring-2 ring-indigo-400 bg-white/80"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              onClick={() => {
                setLoading(true)
                setSelectedScreenshot(screenshot._id)
              }}>
              <div className="p-2">
                <img
                  src={screenshot.imageUrl}
                  alt="Screenshot thumbnail"
                  className="w-full h-auto rounded-md"
                />
                <p className="text-xs text-indigo-700 mt-2 font-medium">
                  {new Date(screenshot.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="w-2/3 overflow-y-auto p-4">
          {selectedScreenshot && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  const screenshot = screenshots.find(
                    (s) => s._id === selectedScreenshot
                  )
                  if (screenshot) {
                    onSelectScreenshot(screenshot.imageUrl, screenshot._id)
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1.5 px-3 rounded-full shadow-sm transition-colors">
                Open in Extension
              </button>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : questions.length > 0 ? (
            questions.map((q) => (
              <div
                key={q._id}
                className="mb-6 rounded-lg bg-white/70 backdrop-blur-sm shadow-sm p-4 border border-white/40">
                <div className="flex items-start mb-2">
                  <div className="bg-indigo-100 rounded-full p-1 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-indigo-700"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="font-medium text-indigo-900">{q.question}</p>
                </div>
                <div className="flex items-start ml-7">
                  <div className="bg-purple-100 rounded-full p-1 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-purple-700"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700">{q.answer}</p>
                </div>
                <p className="text-xs text-indigo-500 mt-3 text-right">
                  {new Date(q.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-32 bg-white/50 rounded-lg border border-white/40 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-300 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-center text-indigo-500 font-medium">
                No questions for this screenshot
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
