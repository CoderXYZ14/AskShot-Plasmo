import { useState, useEffect } from "react"
import { getScreenshots, getScreenshotQuestions } from "~utils/api"

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
}

export const ScreenshotHistory = ({ onSelectScreenshot }: ScreenshotHistoryProps) => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadScreenshots()
  }, [])

  useEffect(() => {
    if (selectedScreenshot) {
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
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-2 px-4">Screenshot History</h2>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r overflow-y-auto">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot._id}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedScreenshot === screenshot._id ? "bg-blue-50" : ""
              }`}
              onClick={() => handleSelectScreenshot(screenshot)}
            >
              <img
                src={screenshot.imageUrl}
                alt="Screenshot thumbnail"
                className="w-full h-auto rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                {new Date(screenshot.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="w-2/3 overflow-y-auto p-2">
          {questions.length > 0 ? (
            questions.map((q) => (
              <div key={q._id} className="mb-4 border-b pb-2">
                <p className="font-medium">Q: {q.question}</p>
                <p className="text-gray-700 mt-1">A: {q.answer}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(q.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No questions for this screenshot</p>
          )}
        </div>
      </div>
    </div>
  )
}
