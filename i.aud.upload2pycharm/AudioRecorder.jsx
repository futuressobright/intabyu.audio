// src/components/AudioRecorder/AudioRecorder.jsx
import React, { useState, useEffect } from 'react';
import { AudioRecorderService } from '../../services/audioRecorder';

const AudioRecorder = ({ questionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorderService, setRecorderService] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecordings();
  }, [questionId]);

  const loadRecordings = async () => {
    if (!questionId) return;
    try {
      const response = await fetch(`http://localhost:3002/api/recordings?questionId=${questionId}`);
      if (!response.ok) throw new Error('Failed to load recordings');
      const data = await response.json();
      setRecordings(data);
    } catch (error) {
      setError('Failed to load recordings');
      console.error('Error loading recordings:', error);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const recorder = new AudioRecorderService();
      await recorder.initialize();
      setRecorderService(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setError('Failed to start recording');
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recorderService) return;
    try {
      const audioUrl = await recorderService.stop();
      setIsRecording(false);

      const response = await fetch(audioUrl);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;

        const serverResponse = await fetch('http://localhost:3002/api/recordings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            audioData: base64data
          })
        });

        if (!serverResponse.ok) throw new Error('Failed to save recording');

        const newRecording = await serverResponse.json();
        setRecordings(prev => [...prev, newRecording]);
      };
    } catch (error) {
      setError('Failed to save recording');
      console.error('Error stopping recording:', error);
    }
    setRecorderService(null);
  };

  return (
    <div className="mt-4 space-y-4">
      {error && (
        <div className="text-red-500 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Record Answer
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Stop Recording
          </button>
        )}
      </div>

      {recordings.length > 0 && (
        <div className="space-y-2">
          {recordings.slice().reverse().map((recording) => (
            <div key={recording.id} className="flex items-center gap-2 p-2 bg-white rounded shadow">
              <audio
                src={`http://localhost:3002${recording.audio_url}`}
                controls
                className="w-full"
              />
              <span className="text-sm text-gray-500">
                {new Date(recording.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;