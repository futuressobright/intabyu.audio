import React, { useState, useRef, useCallback } from 'react';

const AudioRecorder = () => {
  // State management for recording status and audio URL
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  
  // Refs to hold MediaRecorder instance and audio chunks
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  
  // Initialize media recorder with user's microphone
  const initializeRecording = useCallback(async () => {
    try {
      // Request microphone access and create media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create new MediaRecorder instance
      mediaRecorder.current = new MediaRecorder(stream);
      
      // Handle incoming audio data
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.current.onstop = () => {
        // Combine audio chunks into a blob
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        // Create URL for the audio blob
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        audioChunks.current = [];
      };
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // In a production app, we'd want to show this error to the user
    }
  }, []);
  
  // Start recording function
  const startRecording = async () => {
    audioChunks.current = [];
    setAudioURL('');
    
    // Initialize if not already done
    if (!mediaRecorder.current) {
      await initializeRecording();
    }
    
    mediaRecorder.current.start();
    setIsRecording(true);
    
    // Automatically stop after 90 seconds
    setTimeout(() => {
      if (mediaRecorder.current?.state === 'recording') {
        stopRecording();
      }
    }, 90000);
  };
  
  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      // Stop all tracks in the stream
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-4">
        {/* Recording controls */}
        <div className="flex gap-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`px-4 py-2 rounded ${
              isRecording 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`px-4 py-2 rounded ${
              !isRecording 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            Stop Recording
          </button>
        </div>
        
        {/* Audio playback */}
        {audioURL && (
          <audio 
            controls
            src={audioURL}
            className="w-full max-w-md"
          />
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
