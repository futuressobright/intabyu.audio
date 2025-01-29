import React from 'react'
import './index.css'

import Practice from './components/Practice.jsx';


function App() {
  return (
          <div className="min-h-screen bg-gray-300 p-4">
              <div className="container mx-auto max-w-4xl bg-white rounded-3xl border shadow-sm overflow-hidden">
                  <Practice/>
              </div>
          </div>
  );
}

export default App