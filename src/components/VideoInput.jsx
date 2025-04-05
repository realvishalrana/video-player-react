import React, { useState } from "react";

function VideoInput({ onLoadVideo }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onLoadVideo(url);
    }
  };

  return (
    <section className="p-4 border border-gray-200 rounded-md bg-gray-50">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">
        1. Load Video
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="videoUrl"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            YouTube Video URL:
          </label>
          <input
            type="url"
            id="videoUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={!url}
        >
          Load Video
        </button>
      </form>
    </section>
  );
}

export default VideoInput;
