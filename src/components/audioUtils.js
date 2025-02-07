const API_BASE_URL = 'http://localhost:3002';

export const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const loadRecordings = async (questionId) => {
  if (!questionId) return [];
  
  const response = await fetch(`${API_BASE_URL}/api/recordings?questionId=${questionId}`);
  if (!response.ok) throw new Error('Failed to load recordings');
  const data = await response.json();

  return data.map(recording => ({
    ...recording,
    audio_url: recording.audio_url.startsWith('http')
      ? recording.audio_url
      : `${API_BASE_URL}${recording.audio_url}`
  }));
};

export const deleteRecording = async (recordingId) => {
  const response = await fetch(`${API_BASE_URL}/api/recordings/${recordingId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete recording');
  return true;
};

export const saveRecording = async (questionId, audioData, duration) => {
  const response = await fetch(`${API_BASE_URL}/api/recordings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId,
      audioData,
      duration
    })
  });

  if (!response.ok) throw new Error('Failed to save recording');
  const newRecording = await response.json();
  
  return {
    ...newRecording,
    audio_url: newRecording.audio_url.startsWith('http')
      ? newRecording.audio_url
      : `${API_BASE_URL}${newRecording.audio_url}`
  };
};
