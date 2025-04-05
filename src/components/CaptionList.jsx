import React from 'react';

function CaptionList({ captions, onDeleteCaption }) {
  if (!captions || captions.length === 0) {
    return null; // Don't render anything if no captions
  }

  // Sort captions by start time for better readability
  const sortedCaptions = [...captions].sort((a, b) => a.startTime - b.startTime);

  return (
    <section className="caption-section">
      <h2>Added Captions</h2>
      <ul className="caption-list">
        {sortedCaptions.map((caption) => (
          <li key={caption.id}>
            <span className="time">
              [{caption.startTime.toFixed(1)}s - {caption.endTime.toFixed(1)}s]
            </span>
            <span className="text">{caption.text}</span>
            <button onClick={() => onDeleteCaption(caption.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CaptionList;