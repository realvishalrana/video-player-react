import React, { useState } from 'react';

function CaptionInput({ onAddCaption, videoDuration, isVideoReady }) {
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const isDisabled = !isVideoReady; // Determine if inputs should be disabled

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddClick = () => {
    const start = parseFloat(startTime);
    const end = parseFloat(endTime);
    setError(''); // Clear previous errors

    if (isDisabled) {
        setError('Load a video and wait for it to be ready first.');
        return;
    }

    if (!text.trim()) {
      setError('Caption text cannot be empty.');
      return;
    }
    if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
      setError('Start and End times must be valid positive numbers (in seconds).');
      return;
    }
    if (start >= end) {
      setError('Start time must be less than End time.');
      return;
    }
    // --- Video Duration Validation ---
    if (videoDuration <= 0) {
        setError('Video duration is not available. Cannot validate times.');
        return; // Should not happen if isVideoReady is true, but safety check
    }
    if (start >= videoDuration) {
        setError(`Start time (${start.toFixed(1)}s) cannot be at or after the video ends (${videoDuration.toFixed(1)}s).`);
        return;
    }
     if (end > videoDuration) {
         setError(`End time (${end.toFixed(1)}s) cannot be after the video ends (${videoDuration.toFixed(1)}s). Adjust or shorten the caption.`);
         // Optional: Automatically clamp end time?
         // end = videoDuration;
         return;
     }
    // --- End Validation ---


    const newCaption = {
      id: Date.now(),
      startTime: start,
      endTime: end,
      text: text.trim(),
    };

    onAddCaption(newCaption);

    // Clear form
    setText('');
    setStartTime('');
    setEndTime('');
  };

  return (
    // Section container with conditional styling for disabled state
    <section className={`p-4 border rounded-md ${isDisabled ? 'bg-gray-200 border-gray-300' : 'bg-gray-50 border-gray-200'}`}>
      <h2 className="text-xl font-semibold mb-3 text-gray-700">2. Add Captions</h2>

      {!isDisabled && videoDuration > 0 && (
          <p className="text-sm text-gray-500 mb-3">
            Video Length: {formatTime(videoDuration)} ({videoDuration.toFixed(1)}s)
          </p>
      )}
      {isDisabled && (
           <p className="text-sm text-center text-gray-500 mb-3 p-2 bg-gray-100 rounded">
               Load a video first to enable caption adding.
           </p>
      )}


      <div className="mb-3">
        <label htmlFor="captionText" className="block text-sm font-medium text-gray-600 mb-1">
          Caption Text:
        </label>
        <input
          type="text"
          id="captionText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter caption text"
          disabled={isDisabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end">
        <div>
           <label htmlFor="startTime" className="block text-sm font-medium text-gray-600 mb-1">
             Start Time (s):
           </label>
           <input
             type="number"
             id="startTime"
             value={startTime}
             onChange={(e) => setStartTime(e.target.value)}
             placeholder="e.g., 5.2"
             step="0.1"
             min="0"
             disabled={isDisabled}
             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
           />
        </div>
         <div className="text-center pt-6 sm:pt-0 text-gray-500 font-medium hidden sm:block">to</div>
        <div>
           <label htmlFor="endTime" className="block text-sm font-medium text-gray-600 mb-1">
             End Time (s):
           </label>
           <input
             type="number"
             id="endTime"
             value={endTime}
             onChange={(e) => setEndTime(e.target.value)}
             placeholder="e.g., 10.5"
             step="0.1"
             min="0"
             disabled={isDisabled}
             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
           />
        </div>
      </div>

       {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        onClick={handleAddClick}
        disabled={isDisabled || !text || !startTime || !endTime} // Also disable if fields empty
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Add Caption
      </button>
    </section>
  );
}

export default CaptionInput;