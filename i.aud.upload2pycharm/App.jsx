import React from 'react'
import QuestionManager from './components/QuestionManager'
import './index.css'

import Practice from './components/practice/Practice';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <Practice />
      </div>
    </div>
  );
}

export default App