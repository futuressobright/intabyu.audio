import React, { useState, useEffect } from 'react';
import { AudioRecorderService } from '../services/audioRecorder.js';
import dbService from '../services/dbService';

const AudioRecorder = ({ questionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
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
        console.log('Loaded recordings:', savedRecordings);
        setRecordings(savedRecordings);
      }
    };

    initRecorder();
    loadRecordings();
  }, [questionId]);

  const startRecording = async () => {
    if (!recorder) return;
    try {
      await recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recorder) return;
    try {
      const audioUrl = await recorder.stop();
      setIsRecording(false);

      const newRecording = {
        id: Date.now(),
        questionId,
        audioUrl,
        timestamp: new Date().toISOString()
      };

      await dbService.saveRecording(newRecording);
      setRecordings(prev => [...prev, newRecording]);
      console.log('New recording saved:', newRecording);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-2">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!recorder}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
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