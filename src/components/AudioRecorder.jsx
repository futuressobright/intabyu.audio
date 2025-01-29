import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Pause, Clock } from 'lucide-react';
import { AudioRecorderService } from '../services/audioRecorder.js';

const API_BASE_URL = 'http://localhost:3002';

const AudioRecorder = ({ questionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorderService, setRecorderService] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState({});

  // Initialize recordings when questionId changes
  useEffect(() => {
    loadRecordings();
  }, [questionId]);

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadRecordings = async () => {
    if (!questionId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/recordings?questionId=${questionId}`);
      if (!response.ok) throw new Error('Failed to load recordings');
      const data = await response.json();

      // Process recordings to ensure proper audio URLs
      const processedRecordings = data.map(recording => ({
        ...recording,
        audio_url: recording.audio_url.startsWith('http')
          ? recording.audio_url
          : `${API_BASE_URL}${recording.audio_url}`
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
      const audioUrl = await recorderService.stop();
      setIsRecording(false);

      const response = await fetch(audioUrl);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;

        const serverResponse = await fetch(`${API_BASE_URL}/api/recordings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            audioData: base64data
          })
        });

        if (!serverResponse.ok) throw new Error('Failed to save recording');

        const newRecording = await serverResponse.json();
        newRecording.audio_url = newRecording.audio_url.startsWith('http')
          ? newRecording.audio_url
          : `${API_BASE_URL}${newRecording.audio_url}`;

        setRecordings(prev => [newRecording, ...prev]);
      };
    } catch (error) {
      setError('Failed to save recording');
      console.error('Error stopping recording:', error);
    }
    setRecorderService(null);
  };

  // Handle play/pause state for recordings
  const handlePlayToggle = (recordingId) => {
    setIsPlaying(prev => ({
      ...prev,
      [recordingId]: !prev[recordingId]
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-4">Loading recordings...</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Record button with animation */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg
                     hover:bg-purple-600 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
            <span>Record</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg
                       hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Recordings list with enhanced UI */}
      {recordings.length > 0 && (
        <div className="space-y-3 mt-2">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200
                       hover:border-purple-200 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(recording.created_at || recording.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => handlePlayToggle(recording.id)}
                  className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                >
                  {isPlaying[recording.id] ? (
                    <Pause className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Play className="w-4 h-4 text-purple-600" />
                  )}
                </button>
              </div>

              <audio
                src={recording.audio_url}
                controls
                className="w-full"
                onPlay={() => handlePlayToggle(recording.id)}
                onPause={() => handlePlayToggle(recording.id)}
                onError={(e) => {
                  console.error('Audio playback error:', e);
                  e.target.closest('.flex').classList.add('border-red-500');
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;