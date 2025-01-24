import React from 'react'
import QuestionManager from './components/QuestionManager'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Interview Practice</h1>
        <QuestionManager />
      </div>
    </div>
  )
}

export default App