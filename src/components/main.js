import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [captions, setCaptions] = useState([]);
  const [currentCaption, setCurrentCaption] = useState({ start: 0, end: 0, text: '' });
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const playerRef = useRef(null);

  // Update video URL from input field
  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
    setErrorMsg('');
  };

  // Handle file upload and create a URL for the video
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setVideoUrl(fileUrl);
      setErrorMsg('');
    }
  };

  // Update caption fields as the user types
  const handleCaptionChange = (e) => {
    const { name, value } = e.target;
    setCurrentCaption((prev) => ({
      ...prev,
      [name]: name === 'text' ? value : parseFloat(value),
    }));
  };

  // Set the current video time as the caption's start time
  const setStartTime = () => {
    if (currentTime > videoDuration) {
      setErrorMsg('Current time exceeds video duration.');
      return;
    }
    setCurrentCaption((prev) => ({ ...prev, start: currentTime }));
    setErrorMsg('');
  };

  // Set the current video time as the caption's end time
  const setEndTime = () => {
    if (currentTime > videoDuration) {
      setErrorMsg('Current time exceeds video duration.');
      return;
    }
    setCurrentCaption((prev) => ({ ...prev, end: currentTime }));
    setErrorMsg('');
  };

  // Validate and add a new caption
  const addCaption = () => {
    setErrorMsg('');
    const { start, end, text } = currentCaption;
    const trimmedText = text.trim();

    // Validate times and caption text
    if (isNaN(start) || isNaN(end)) {
      setErrorMsg('Start and end times must be numbers.');
      return;
    }
    if (start < 0 || end < 0) {
      setErrorMsg('Start and end times cannot be negative.');
      return;
    }
    if (end <= start) {
      setErrorMsg('End time must be greater than start time.');
      return;
    }
    if (start > videoDuration || end > videoDuration) {
      setErrorMsg(`Caption times cannot exceed the video duration of ${videoDuration.toFixed(2)} seconds.`);
      return;
    }
    if (!trimmedText) {
      setErrorMsg('Caption text cannot be empty.');
      return;
    }

    // Add the valid caption and reset the caption input fields
    setCaptions((prev) => [...prev, { start, end, text: trimmedText }]);
    setCurrentCaption({ start: 0, end: 0, text: '' });
  };

  // Update the current playback time
  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  // Save the video's duration once it's loaded
  const handleDuration = (duration) => {
    setVideoDuration(duration);
  };

  // Toggle play/pause of the video
  const togglePlay = () => {
    setPlaying((prev) => !prev);
  };

  // Download captions as a JSON file
  const downloadCaptions = () => {
    const dataStr = JSON.stringify(captions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'captions.json';
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Captions Generator</h1>

      {/* Video URL / File Upload */}
      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Paste video link here..."
          value={videoUrl}
          onChange={handleVideoUrlChange}
          className="border border-gray-300 p-2 w-full rounded"
        />
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="border border-gray-300 p-2 w-full rounded"
        />
      </div>

      {/* Main Content: Video Player & Caption Editor */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Video Player with Caption Overlay */}
        <div className="md:w-2/3 relative">
          {videoUrl ? (
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              controls
              playing={playing}
              width="100%"
              onProgress={handleProgress}
              onDuration={handleDuration}
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500">
              No video loaded
            </div>
          )}

          {/* Caption Overlay */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            {captions.map((caption, index) =>
              currentTime >= caption.start && currentTime <= caption.end ? (
                <div
                  key={index}
                  className="bg-black bg-opacity-70 text-white p-2 mb-8 rounded text-center"
                >
                  {caption.text}
                </div>
              ) : null
            )}
          </div>

          {/* Current Time & Play/Pause Button */}
          <div className="mt-2 flex items-center space-x-4">
            <p className="text-sm">
              Current Time: <span className="font-mono">{currentTime.toFixed(2)}s</span>
            </p>
            <button
              onClick={togglePlay}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
          {videoDuration > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Video Duration: {videoDuration.toFixed(2)}s
            </p>
          )}
        </div>

        {/* Caption Editor */}
        <div className="md:w-1/3">
          <h2 className="text-2xl font-semibold mb-4">Add Caption</h2>

          {/* Display Error Message if any */}
          {errorMsg && (
            <div className="bg-red-100 text-red-700 border border-red-300 p-2 rounded mb-4">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time (s)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  name="start"
                  placeholder="Start Time (s)"
                  value={currentCaption.start || ''}
                  onChange={handleCaptionChange}
                  className="border border-gray-300 p-2 w-full rounded"
                />
                <button
                  onClick={setStartTime}
                  className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded"
                >
                  Set Start
                </button>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                End Time (s)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  name="end"
                  placeholder="End Time (s)"
                  value={currentCaption.end || ''}
                  onChange={handleCaptionChange}
                  className="border border-gray-300 p-2 w-full rounded"
                />
                <button
                  onClick={setEndTime}
                  className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded"
                >
                  Set End
                </button>
              </div>
            </div>

            {/* Caption Text */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Caption Text
              </label>
              <textarea
                name="text"
                placeholder="Enter caption text..."
                value={currentCaption.text}
                onChange={handleCaptionChange}
                className="border border-gray-300 p-2 w-full h-24 rounded"
              />
            </div>

            {/* Button to Add Caption */}
            <button
              onClick={addCaption}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
            >
              Add Caption
            </button>
          </div>

          {/* Captions Timeline */}
          <h2 className="text-2xl font-semibold mt-8 mb-4">Captions Timeline</h2>
          <ul className="space-y-2">
            {captions.map((caption, index) => (
              <li key={index} className="border border-gray-300 p-2 rounded">
                <span className="font-mono">
                  {caption.start.toFixed(1)}s - {caption.end.toFixed(1)}s
                </span>
                <p>{caption.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Download Captions Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={downloadCaptions}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Download Captions (.json)
        </button>
      </div>
    </div>
  );
}

export default App;
