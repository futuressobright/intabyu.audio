// src/components/AudioRecorder.jsx
import React, { useState, useEffect } from 'react';
import { AudioRecorderService } from '../services/audioRecorder';
import dbService from '../services/dbService';

const AudioRecorder = ({ questionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const initRecorder = async () => {
      const recorderService = new AudioRecorderService();
      await recorderService.initialize();
      setRecorder(recorderService);
    };

    const loadRecordings = async () => {
      if (questionId) {
        const savedRecordings = await dbService.getRecordingsByQuestionId(questionId);
        setRecordings(savedRecordings);
      }
    };

    initRecorder().catch(console.error);
    loadRecordings().catch(console.error);
  }, [questionId]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      recorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const url = await recorder.stop();
      setAudioUrl(url);
      setIsRecording(false);

      // Save the recording if we have a questionId
      if (questionId) {
        const recording = {
          id: Date.now(),
          questionId,
          audioUrl: url,
          timestamp: new Date().toISOString()
        };

        await dbService.saveRecording(recording);
        setRecordings([...recordings, recording]);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={startRecording}
            disabled={isRecording || !recorder}
            className={`px-4 py-2 rounded ${
              isRecording || !recorder
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

        {isRecording && (
          <div>Recording in progress...</div>
        )}

        {audioUrl && (
          <audio src={audioUrl} controls className="mt-4" />
        )}

        {recordings.length > 0 && (
          <div className="mt-4 w-full">
            <h3 className="text-lg font-semibold mb-2">Previous Recordings</h3>
            <div className="space-y-2">
              {recordings.map(recording => (
                <div key={recording.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <audio src={recording.audioUrl} controls className="flex-1" />
                  <span className="text-sm text-gray-500">
                    {new Date(recording.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;