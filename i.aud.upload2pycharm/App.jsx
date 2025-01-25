import React from 'react'
import QuestionManager from './components/QuestionManager'
import './index.css'

import Practice from './components/practice/Practice';


function App() {
  return (
    <div className="min-h-screen bg-gray-300 p-4">
      <div className="container mx-auto max-w-4xl bg-white rounded-3xl border shadow-sm p-8">
        <Practice />
      </div>
    </div>
  );
}

export default App