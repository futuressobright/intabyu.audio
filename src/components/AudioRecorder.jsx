import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Clock, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [activeRecordingIndex, setActiveRecordingIndex] = useState(0);
  const audioRefs = useRef({});

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
      setActiveRecordingIndex(0); // Reset to first recording when loading new ones
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
        setActiveRecordingIndex(0); // Set focus to the new recording
      };
    } catch (error) {
      setError('Failed to save recording');
      console.error('Error stopping recording:', error);
    }
    setRecorderService(null);
  };

  const handlePlayPause = (recordingId, audioElement) => {
    // Stop other playing audio
    if (currentPlayingId && currentPlayingId !== recordingId) {
      const previousAudio = audioRefs.current[currentPlayingId];
      if (previousAudio) {
        previousAudio.pause();
        previousAudio.currentTime = 0;
      }
    }

    if (audioElement.paused) {
      audioElement.play();
      setCurrentPlayingId(recordingId);
    } else {
      audioElement.pause();
      setCurrentPlayingId(null);
    }
  };

  const navigateRecordings = (direction) => {
    setCurrentPlayingId(null); // Stop any playing audio
    if (direction === 'next' && activeRecordingIndex < recordings.length - 1) {
      setActiveRecordingIndex(prev => prev + 1);
    } else if (direction === 'prev' && activeRecordingIndex > 0) {
      setActiveRecordingIndex(prev => prev - 1);
    }
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

      {/* Recording Controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-purple-50"
          >
            <Mic className="w-4 h-4" />
            <span>Record</span>
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </Button>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls and Counter */}
      {recordings.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateRecordings('prev')}
            disabled={activeRecordingIndex === 0}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm text-gray-600">
            Recording {activeRecordingIndex + 1} of {recordings.length}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateRecordings('next')}
            disabled={activeRecordingIndex === recordings.length - 1}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="space-y-2">
          {recordings.map((recording, index) => {
            const date = new Date(recording.created_at);
            const isActive = index === activeRecordingIndex;

            return (
              <div
                key={recording.id}
                className={`flex items-center gap-3 p-2 rounded-lg bg-white border 
                         transition-all duration-200 ${
                           isActive 
                           ? 'border-purple-200 bg-purple-50/50 shadow-sm' 
                           : 'border-gray-100 hover:border-purple-100 hover:bg-purple-50/30'
                         }`}
                onClick={() => setActiveRecordingIndex(index)}
              >
                {/* Play/Pause Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    const audio = audioRefs.current[recording.id];
                    if (audio) handlePlayPause(recording.id, audio);
                  }}
                >
                  {currentPlayingId === recording.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                {/* Audio Element and Progress Bar */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1">
                    <audio
                      ref={el => audioRefs.current[recording.id] = el}
                      src={recording.audio_url}
                      className="hidden"
                      onEnded={() => setCurrentPlayingId(null)}
                      onTimeUpdate={(e) => {
                        // Force a re-render to update progress bar
                        setRecordings(prev => [...prev]);
                      }}
                    />
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-200"
                        style={{
                          width: `${audioRefs.current[recording.id]?.currentTime 
                            ? (audioRefs.current[recording.id].currentTime / audioRefs.current[recording.id].duration) * 100 
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-500 min-w-[5rem]">
                    {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;