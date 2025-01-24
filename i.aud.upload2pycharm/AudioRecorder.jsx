import React, { useState, useEffect } from 'react';
import { AudioRecorderService } from '../services/audioRecorder.js';
import dbService from '../services/dbService';

const AudioRecorder = ({ questionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorderService, setRecorderService] = useState(null);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    loadRecordings();
  }, [questionId]);

  const loadRecordings = async () => {
    if (questionId) {
      const savedRecordings = await dbService.getRecordingsByQuestionId(questionId);
      setRecordings(savedRecordings);
    }
  };

  const startRecording = async () => {
    try {
      const recorder = new AudioRecorderService();
      await recorder.initialize();
      setRecorderService(recorder);
      await recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recorderService) return;
    try {
      const audioUrl = await recorderService.stop();
      setIsRecording(false);

      const newRecording = {
        id: Date.now(),
        questionId,
        audioUrl,
        timestamp: new Date().toISOString()
      };

      await dbService.saveRecording(newRecording);
      setRecordings(prev => [...prev, newRecording]);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
    setRecorderService(null);
  };

  return (
    <div className="mt-4 space-y-4">
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
              <audio src={recording.audioUrl} controls className="w-full" />
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