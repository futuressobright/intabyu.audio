import AudioRecorder from './components/AudioRecorder'
import QuestionManager from './components/QuestionManager'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Interview Practice</h1>
        <QuestionManager />
        <AudioRecorder />
      </div>
    </div>
  )
}

export default App