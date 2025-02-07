import React, {useState, useEffect, useRef} from 'react';
import {Mic, Square, Clock, Play, Pause, ChevronLeft, ChevronRight, ChevronDown, ChevronUp} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {AudioRecorderService} from '../services/audioRecorder.js';
import {Trash2} from 'lucide-react';
import RecordingCard from './RecordingCard';  // Add this line


const API_BASE_URL = 'http://localhost:3002';


const AudioRecorder = ({questionId}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recorderService, setRecorderService] = useState(null);
    const [recordings, setRecordings] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [currentPlayingId, setCurrentPlayingId] = useState(null);
    const [activeRecordingIndex, setActiveRecordingIndex] = useState(0);
    const [isListView, setIsListView] = useState(false);
    const [recordingDurations, setRecordingDurations] = useState({});
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
            setActiveRecordingIndex(0);
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

    const handleLoadedMetadata = (recordingId, duration) => {
        setRecordingDurations(prev => ({
            ...prev,
            [recordingId]: duration
        }));
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
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
            const duration = recordingTime;

            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result;

                const serverResponse = await fetch(`${API_BASE_URL}/api/recordings`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        questionId,
                        audioData: base64data,
                        duration
                    })
                });

                if (!serverResponse.ok) throw new Error('Failed to save recording');

                const newRecording = await serverResponse.json();
                newRecording.audio_url = newRecording.audio_url.startsWith('http')
                    ? newRecording.audio_url
                    : `${API_BASE_URL}${newRecording.audio_url}`;

                setRecordings(prev => [newRecording, ...prev]);
                setActiveRecordingIndex(0);
            };
        } catch (error) {
            setError('Failed to save recording');
            console.error('Error stopping recording:', error);
        }
        setRecorderService(null);
    };

    const deleteRecording = async (recordingId) => {
        try {
            await fetch(`${API_BASE_URL}/api/recordings/${recordingId}`, {method: 'DELETE'});
            setRecordings(prev => prev.filter(rec => rec.id !== recordingId));
        } catch (error) {
            console.error('Error deleting recording:', error);
        }
    };

    const handlePlayPause = async (recordingId, audioElement) => {
        try {
            if (currentPlayingId && currentPlayingId !== recordingId) {
                const previousAudio = audioRefs.current[currentPlayingId];
                if (previousAudio) {
                    previousAudio.pause();
                    previousAudio.currentTime = 0;
                }
            }

            if (!audioElement) return;

            if (audioElement.paused) {
                await audioElement.play();
                setCurrentPlayingId(recordingId);
            } else {
                audioElement.pause();
                setCurrentPlayingId(null);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            setError('Failed to play recording');
        }
    };

    const navigateRecordings = (direction) => {
        if (currentPlayingId) {
            const currentAudio = audioRefs.current[currentPlayingId];
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            setCurrentPlayingId(null);
        }

        const newIndex = direction === 'next'
            ? activeRecordingIndex + 1
            : activeRecordingIndex - 1;

        if (newIndex >= 0 && newIndex < recordings.length) {
            setActiveRecordingIndex(newIndex);
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

            <div className="flex items-center gap-3">
                {!isRecording ? (<Button
                        onClick={startRecording}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700"
                    >
                        <Mic className="w-4 h-4"/>
                        <span>Record</span>
                    </Button>
                ) : (
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={stopRecording}
                            variant="destructive"
                            className="flex items-center gap-2"
                        >
                            <Square className="w-4 h-4"/>
                            <span>Stop</span>
                        </Button>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 animate-pulse"/>
                            <span>{formatTime(recordingTime)}</span>
                        </div>
                    </div>
                )}

                {recordings.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsListView(!isListView)}
                        className="ml-auto"
                    >
                        {isListView ? (
                            <ChevronUp className="h-4 w-4"/>
                        ) : (
                            <ChevronDown className="h-4 w-4"/>
                        )}
                    </Button>
                )}
            </div>

            {recordings.length > 0 && (
                <div className="flex items-center justify-end gap-2 bg-gray-50 p-1 rounded-lg ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateRecordings('prev')}
                        disabled={activeRecordingIndex === 0}
                        className="h-7 w-7 p-0"
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <span className="text-sm text-gray-500">
        {activeRecordingIndex + 1}/{recordings.length}
    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateRecordings('next')}
                        disabled={activeRecordingIndex === recordings.length - 1}
                        className="h-7 w-7 p-0"
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                </div>
            )}

            {recordings.length > 0 && (
                <div className={`relative space-y-2 transition-all duration-300 ${
                    isListView ? 'max-h-96 overflow-y-auto' : 'h-32'
                }`}>
                    {recordings.map((recording, index) => (
                        <RecordingCard
                            key={recording.id}
                            recording={recording}
                            index={index}
                            isActive={isListView || index === activeRecordingIndex}
                            isListView={isListView}
                            handlePlayPause={handlePlayPause}
                            currentPlayingId={currentPlayingId}
                            audioRefs={audioRefs}
                            activeRecordingIndex={activeRecordingIndex}
                            onLoadedMetadata={handleLoadedMetadata}
                            onDelete={deleteRecording}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;