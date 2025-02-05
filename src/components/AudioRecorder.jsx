import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Clock } from 'lucide-react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { AudioRecorderService } from '../services/audioRecorder.js';

const API_BASE_URL = 'http://localhost:3002';

const AudioRecorder = ({ questionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorderService, setRecorderService] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const playerRefs = useRef({});

  const loadRecordings = async () => {
    if (!questionId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/recordings?questionId=${questionId}`);
      if (!response.ok) throw new Error('Failed to load recordings');
      const data = await response.json();

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

  useEffect(() => {
    loadRecordings();
  }, [questionId]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      console.log('About to create AudioRecorderService');
      const recorder = new AudioRecorderService();
      console.log('Recorder created:', recorder);

      await recorder.initialize();
      console.log('Recorder initialized:', recorder);

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
      setIsRecording(false);

      const blob = await recorderService.stop();

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

      {recordings.length > 0 && (
        <div className="space-y-3 mt-2">
          {recordings.map((recording) => (
              <div
                  key={recording.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-transparent
            hover:border-purple-100 hover:bg-purple-50/30 transition-all duration-200"
              >






      <AudioPlayer
          ref={instance => {
            playerRefs.current[recording.id] = instance
          }}
          src={recording.audio_url}
          onPlay={() => {
            if (currentPlayingId && currentPlayingId !== recording.id) {
              const previousPlayer = playerRefs.current[currentPlayingId];
              if (previousPlayer && previousPlayer.audio.current) {
                previousPlayer.audio.current.pause();
                previousPlayer.audio.current.currentTime = 0;
              }
            }
            setCurrentPlayingId(recording.id);
          }}
          className="rounded-lg overflow-hidden flex-1"
          customStyles={{
            container: {
              backgroundColor: 'transparent',
              boxShadow: 'none'
            },
            progressBar: {
              backgroundColor: '#8B5CF6'
            },
            volumeBar: {
              backgroundColor: '#8B5CF6'
            }
          }}
          showJumpControls={false}
          layout="horizontal"
      />

      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        <Clock className="w-3 h-3" />
        <span className="text-xs">
          {new Date(recording.created_at || recording.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}
        </span>
      </div>







              </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;