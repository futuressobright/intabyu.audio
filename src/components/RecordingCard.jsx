import React, {useState, useEffect, useRef} from 'react';
import {Play, Pause, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';

const RecordingCard = ({
                           recording,
                           index,
                           length,
                           isActive,
                           isListView,
                           handlePlayPause,
                           currentPlayingId,
                           audioRefs,
                           activeRecordingIndex,
                           onLoadedMetadata,
                           onDelete
                       }) => {
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const audio = new Audio(recording.audio_url);
        audioRef.current = audio;
        audioRefs.current[recording.id] = audio;

        // Use stored duration from database
        if (recording.duration) {
            setDuration(recording.duration);
        }

        const handleLoadedMetadata = () => {
            if (!recording.duration && audio.readyState >= 2 && !isNaN(audio.duration) && audio.duration > 0) {
                setDuration(audio.duration);
                onLoadedMetadata(recording.id, audio.duration);
            }
        };

        const updateTime = () => {
            if (!isDragging) {
                setCurrentTime(audio.currentTime);
                if (progressBarRef.current && audio.duration > 0) {
                    progressBarRef.current.style.setProperty('--progress', `${(audio.currentTime / audio.duration) * 100}%`);
                }
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        audio.load();

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            delete audioRefs.current[recording.id];
        };
    }, [recording.audio_url, recording.id, isDragging]);

    const handleProgressBarClick = (e) => {
        if (!audioRef.current || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = clickPosition * duration;
        if (!isNaN(newTime) && isFinite(newTime)) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time) => {
        if (!isFinite(time) || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            className={`flex flex-col gap-3 p-4 rounded-lg bg-white border 
        transition-all duration-300 ${
                isActive
                    ? 'border-blue-200 bg-blue-50/50 shadow-sm scale-100 opacity-100'
                    : isListView
                        ? 'border-gray-100 hover:border-blue-100 hover:bg-blue-50/30'
                        : 'scale-95 opacity-0 absolute pointer-events-none'
            }`}
            style={{
                transform: !isListView && !isActive ? `translateX(${index < activeRecordingIndex ? '-100%' : '100%'})` : undefined
            }}
        >
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Recording {length - index}</span>
                <span>{new Date(recording.created_at).toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${isPlaying ? 'text-purple-600' : ''}`}
                    onClick={() => {
                        if (audioRef.current) {
                            handlePlayPause(recording.id, audioRef.current);
                        }
                    }}
                >
                    {isPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                </Button>

                <div className="flex-1 group relative">
                    <div
                        ref={progressBarRef}
                        className="h-2 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={handleProgressBarClick}
                    >
                        <div
                            className="absolute inset-y-0 left-0 bg-blue-500 transition-[width] duration-100"
                            style={{width: `${progress}%`}}
                        />
                    </div>
                </div>

                <span className="text-xs text-gray-600 ml-3 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(recording.id)}
                    className="h-8 w-8 p-0"
                >
                    <Trash2 className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
};

export default RecordingCard;
