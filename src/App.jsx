import React, { useState } from "react";
import VideoInput from "./components/VideoInput";
import CaptionInput from "./components/CaptionInput";
import CaptionList from "./components/CaptionList";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const [videoSrc, setVideoSrc] = useState("");
  const [captions, setCaptions] = useState([]); // Array of {id, startTime, endTime, text}
  const [videoDuration, setVideoDuration] = useState(0); // Add state for duration
  const [isVideoReady, setIsVideoReady] = useState(false); // Flag for player readiness

  const handleLoadVideo = (url) => {
    setVideoSrc(url);
    setCaptions([]); // Reset captions for new video
    setVideoDuration(0); // Reset duration
    setIsVideoReady(false); // Reset ready state
  };

  const handleAddCaption = (newCaption) => {
    setCaptions((prevCaptions) =>
      [...prevCaptions, newCaption].sort((a, b) => a.startTime - b.startTime)
    ); // Keep sorted
  };

  const handleDeleteCaption = (captionId) => {
    setCaptions((prevCaptions) =>
      prevCaptions.filter((c) => c.id !== captionId)
    );
  };

  // Callback from VideoPlayer when duration is known
  const handleDurationChange = (duration) => {
    if (duration && duration > 0) {
      console.log("Video Duration Received:", duration);
      setVideoDuration(duration);
      setIsVideoReady(true); // Mark as ready once duration is positive
    } else {
      // Handle cases where duration might be 0 initially or invalid
      setIsVideoReady(false);
    }
  };

  // Callback from VideoPlayer when it's truly ready (API loaded, player created)
  const handlePlayerReady = (isReady) => {
    // While duration is the main trigger, this could be used for finer control if needed
    // For now, handleDurationChange is sufficient to enable inputs
    // setIsVideoReady(isReady);
  };

  return (
    // Main container with Tailwind classes
    <div className="container mx-auto max-w-4xl p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Simple Video Captioner
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Video Input Section */}
        <VideoInput onLoadVideo={handleLoadVideo} />

        {/* Caption Input Section */}
        <CaptionInput
          onAddCaption={handleAddCaption}
          videoDuration={videoDuration}
          isVideoReady={isVideoReady} // Pass readiness flag
        />
      </div>

      {/* Caption List Section - Conditionally rendered or styled */}
      {isVideoReady && captions.length > 0 && (
        <CaptionList
          captions={captions}
          onDeleteCaption={handleDeleteCaption}
        />
      )}
      {isVideoReady && captions.length === 0 && (
        <div className="p-4 mb-6 border border-gray-200 rounded-md bg-gray-50 text-center text-gray-500">
          No captions added yet. Use the form above.
        </div>
      )}
      {!isVideoReady && videoSrc && (
        <div className="p-4 mb-6 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center text-gray-500">
          Waiting for video metadata...
        </div>
      )}

      {/* Video Player Section */}
      <VideoPlayer
        videoSrc={videoSrc}
        captions={captions}
        onDurationChange={handleDurationChange} // Pass callback
        onPlayerReady={handlePlayerReady} // Pass callback
      />
    </div>
  );
}

export default App;
