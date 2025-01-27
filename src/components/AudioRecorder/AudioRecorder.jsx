import React, { useState, useEffect } from 'react';
import { AudioRecorderService } from '../../services/audioRecorder';

const API_CONFIG = {
  BASE_URL: 'http://localhost:3002',
  ENDPOINTS: {
    RECORDINGS: '/api/recordings'
  }
};

const AudioRecorder = ({ questionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorderService, setRecorderService] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, [questionId]);

  const loadRecordings = async () => {
    if (!questionId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECORDINGS}?questionId=${questionId}`);
      if (!response.ok) throw new Error('Failed to load recordings');
      const data = await response.json();

      // Ensure all recordings have proper audio URLs
      const processedRecordings = data.map(recording => ({
        ...recording,
        audio_url: recording.audio_url.startsWith('http')
          ? recording.audio_url
          : `${API_CONFIG.BASE_URL}${recording.audio_url}`
      }));

      setRecordings(processedRecordings);
      setError(null);
    } catch (error) {
      console.error('Error loading recordings:', error);
      setError('Failed to load recordings');
    } finally {
      setIsLoading(false);
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
      const audioBlob = await recorderService.stop();  // Now returns blob directly
      setIsRecording(false);

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);  // Convert blob directly to base64
      reader.onloadend = async () => {
        const base64data = reader.result;

        const serverResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECORDINGS}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            audioData: base64data
          })
        });

        if (!serverResponse.ok) throw new Error('Failed to save recording');

        const newRecording = await serverResponse.json();
        // Ensure the new recording has a proper audio URL
        newRecording.audio_url = newRecording.audio_url.startsWith('http')
          ? newRecording.audio_url
          : `${API_CONFIG.BASE_URL}${newRecording.audio_url}`;

        setRecordings(prev => [newRecording, ...prev]);
      };
    } catch (error) {
      setError('Failed to save recording');
      console.error('Error stopping recording:', error);
    }
    setRecorderService(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-4">Loading recordings...</div>;
  }

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
          {recordings.map((recording) => (
            <div key={recording.id} className="flex items-center gap-2 p-2 bg-white rounded shadow">
              <audio
                src={recording.audio_url}
                controls
                className="w-full"
                onError={(e) => {
                  console.error('Audio playback error:', e);
                  setError('Unable to play recording. The file may be missing.');
                }}
              />
              <span className="text-sm text-gray-500">
                {new Date(recording.created_at || recording.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;