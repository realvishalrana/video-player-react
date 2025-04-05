// import React, { useState, useEffect, useRef, useCallback } from "react";

// // Helper function to extract YouTube Video ID (same as before)
// function getYouTubeId(url) {
//   if (!url) return null;
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : null;
// }

// const YOUTUBE_PLAYER_CONTAINER_ID = "youtube-player-container"; // ID for the div

// function VideoPlayer({ videoSrc, captions }) {
//   const [activeCaption, setActiveCaption] = useState("");
//   const [error, setError] = useState("");
//   const [isApiReady, setIsApiReady] = useState(
//     Boolean(window.YT && window.YT.Player)
//   ); // Check if API already loaded
//   const playerRef = useRef(null); // To store the YT.Player instance
//   const intervalRef = useRef(null); // To store the interval timer

//   const videoId = getYouTubeId(videoSrc);

//   // --- API Loading ---
//   useEffect(() => {
//     // Function to run when the YouTube API script is loaded
//     window.onYouTubeIframeAPIReady = () => {
//       console.log("YouTube IFrame API Ready");
//       setIsApiReady(true);
//     };

//     // Check if the API is already loaded or the script tag exists
//     if (!window.YT && !document.getElementById("youtube-iframe-api")) {
//       console.log("Loading YouTube IFrame API script...");
//       const tag = document.createElement("script");
//       tag.id = "youtube-iframe-api"; // Give it an ID to avoid reloading
//       tag.src = "https://www.youtube.com/iframe_api";
//       document.body.appendChild(tag);
//     } else if (window.YT && window.YT.Player) {
//       // If API was already loaded before component mount
//       setIsApiReady(true);
//     }

//     // Cleanup function: remove the global callback if component unmounts
//     // before API is ready (less critical, but good practice)
//     return () => {
//       // We might not want to remove the global callback if other
//       // components potentially use it, but in this simple app it's okay.
//       // delete window.onYouTubeIframeAPIReady;
//       // It's generally safer *not* to delete it if unsure.
//     };
//   }, []); // Run only once on component mount

//   // --- Caption Update Logic ---
//   const updateCaption = useCallback(() => {
//     if (
//       playerRef.current &&
//       typeof playerRef.current.getCurrentTime === "function"
//     ) {
//       try {
//         const currentTime = playerRef.current.getCurrentTime();
//         if (typeof currentTime !== "number") return; // Guard against API not ready

//         let foundCaption = null;
//         // Ensure captions is an array before iterating
//         const currentCaptions = Array.isArray(captions) ? captions : [];
//         for (const caption of currentCaptions) {
//           if (
//             currentTime >= caption.startTime &&
//             currentTime < caption.endTime
//           ) {
//             foundCaption = caption.text;
//             break;
//           }
//         }
//         setActiveCaption(foundCaption || "");
//       } catch (e) {
//         console.error("Error getting current time or updating caption:", e);
//         // Potentially stop interval if player is in a bad state
//         if (intervalRef.current) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//         }
//       }
//     }
//   }, [captions]); // Recreate this function if captions array changes

//   // --- Player Initialization and Management ---
//   useEffect(() => {
//     // Ensure API is ready, we have a valid video ID, and the container div exists
//     if (
//       isApiReady &&
//       videoId &&
//       document.getElementById(YOUTUBE_PLAYER_CONTAINER_ID)
//     ) {
//       // Function called when the player instance is ready
//       const onPlayerReady = (event) => {
//         console.log("YT Player Instance Ready:", videoId);
//         playerRef.current = event.target; // Store the player instance
//         setError(""); // Clear errors on successful load

//         // Clear any previous interval before starting a new one
//         if (intervalRef.current) {
//           clearInterval(intervalRef.current);
//         }
//         intervalRef.current = setInterval(updateCaption, 300);
//       };

//       // Function called when player state changes
//       const onPlayerStateChange = (event) => {
//         // console.log("Player State Change:", event.data);
//         if (event.data === window.YT.PlayerState.PLAYING) {
//           // Ensure interval is running
//           if (!intervalRef.current) {
//             intervalRef.current = setInterval(updateCaption, 300);
//           }
//         } else {
//           // Clear interval when not playing (paused, ended, buffering, etc.)
//           if (intervalRef.current) {
//             clearInterval(intervalRef.current);
//             intervalRef.current = null;
//           }
//           // Perform one last update check on pause
//           if (event.data === window.YT.PlayerState.PAUSED) {
//             updateCaption();
//           } else if (event.data === window.YT.PlayerState.ENDED) {
//             setActiveCaption(""); // Clear caption on end
//           }
//         }
//       };

//       // Function called on player error
//       const onPlayerError = (event) => {
//         setError(`YouTube Player Error: Code ${event.data}`);
//         console.error("YouTube Player Error:", event.data);
//         if (intervalRef.current) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//         }
//       };

//       // Destroy existing player if videoId changes
//       if (playerRef.current) {
//         console.log("Destroying previous player instance");
//         playerRef.current.destroy();
//         playerRef.current = null;
//         if (intervalRef.current) {
//           clearInterval(intervalRef.current); // Clear interval associated with old player
//           intervalRef.current = null;
//         }
//       }

//       // Create the new player instance
//       console.log(`Creating YT.Player for videoId: ${videoId}`);
//       try {
//         new window.YT.Player(YOUTUBE_PLAYER_CONTAINER_ID, {
//           height: "390",
//           width: "640", // Adjust as needed
//           videoId: videoId,
//           playerVars: {
//             playsinline: 1, // Important for mobile playback
//             autoplay: 0,
//             controls: 1,
//             modestbranding: 1,
//             rel: 0,
//           },
//           events: {
//             onReady: onPlayerReady,
//             onStateChange: onPlayerStateChange,
//             onError: onPlayerError,
//           },
//         });
//         // We don't assign to playerRef here, onPlayerReady does that
//       } catch (e) {
//         console.error("Error creating YT.Player:", e);
//         setError("Failed to initialize YouTube player.");
//       }
//     }

//     // Cleanup function for when videoId changes or component unmounts
//     return () => {
//       console.log("Cleanup: Destroying player and clearing interval");
//       if (
//         playerRef.current &&
//         typeof playerRef.current.destroy === "function"
//       ) {
//         try {
//           playerRef.current.destroy();
//         } catch (e) {
//           console.error("Error destroying player:", e);
//         }
//       }
//       playerRef.current = null;
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//       // Reset state associated with the player
//       setActiveCaption("");
//       // Don't reset error here, it might be a loading error
//     };
//   }, [isApiReady, videoId, updateCaption]); // Dependencies for player creation/management

//   // Effect to clear error when videoSrc changes
//   useEffect(() => {
//     setError("");
//     setActiveCaption(""); // Clear caption when source changes
//   }, [videoSrc]);

//   // --- Rendering Logic ---

//   if (!videoSrc) {
//     return (
//       <section className="video-section">
//         <h2>3. Video Preview</h2>
//         <p>Load a video using the URL input above.</p>
//       </section>
//     );
//   }

//   if (!videoId && videoSrc) {
//     // Check if URL was provided but invalid
//     return (
//       <section className="video-section">
//         <h2>3. Video Preview</h2>
//         <p className="error-message">
//           Invalid YouTube URL provided or could not extract Video ID.
//         </p>
//       </section>
//     );
//   }

//   return (
//     <section className="video-section">
//       <h2>3. Video Preview</h2>
//       {error && <p className="error-message">{error}</p>}
//       {/* Container for the player and the caption overlay */}
//       {/* Set max-width to control overall size */}
//       <div
//         className="video-container"
//         style={{ maxWidth: "640px" /* Match player width */ }}
//       >
//         {/* The div where the YouTube iframe will be injected */}
//         <div id={YOUTUBE_PLAYER_CONTAINER_ID}>
//           {!isApiReady && videoId && <p>Loading YouTube Player...</p>}
//         </div>
//         {/* Caption overlay */}
//         <div className={`caption-overlay ${activeCaption ? "visible" : ""}`}>
//           {activeCaption}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default VideoPlayer;

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Helper function to extract YouTube Video ID (same as before)
function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const YOUTUBE_PLAYER_CONTAINER_ID = 'youtube-player-container';

// Pass the new callback props
function VideoPlayer({ videoSrc, captions, onDurationChange, onPlayerReady: notifyAppPlayerReady }) {
    const [activeCaption, setActiveCaption] = useState('');
    const [error, setError] = useState('');
    const [isApiReady, setIsApiReady] = useState(Boolean(window.YT && window.YT.Player));
    const playerRef = useRef(null);
    const intervalRef = useRef(null);
    const playerContainerRef = useRef(null); // Ref for the container div

    const videoId = getYouTubeId(videoSrc);

    // --- API Loading (same as before) ---
    useEffect(() => {
        window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube IFrame API Ready");
            setIsApiReady(true);
        };
        if (!window.YT && !document.getElementById('youtube-iframe-api')) {
            const tag = document.createElement('script');
            tag.id = 'youtube-iframe-api';
            tag.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(tag);
        } else if (window.YT && window.YT.Player) {
             setIsApiReady(true);
        }
        // No cleanup needed for this specific global callback definition
    }, []);

    // --- Caption Update Logic (same as before, using useCallback) ---
    const updateCaption = useCallback(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            try {
                const currentTime = playerRef.current.getCurrentTime();
                 if (typeof currentTime !== 'number') return;
                let foundCaption = null;
                const currentCaptions = Array.isArray(captions) ? captions : [];
                for (const caption of currentCaptions) {
                    if (currentTime >= caption.startTime && currentTime < caption.endTime) {
                        foundCaption = caption.text;
                        break;
                    }
                }
                 setActiveCaption(foundCaption || '');
            } catch (e) {
                 console.error("Error getting current time or updating caption:", e);
                 if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            }
        }
    }, [captions]);

    // --- Player Initialization and Management ---
    useEffect(() => {
        // Need API ready, a video ID, AND the container ref available
        if (isApiReady && videoId && playerContainerRef.current) {

            const onPlayerReadyCallback = (event) => {
                console.log("YT Player Instance Ready:", videoId);
                playerRef.current = event.target;
                setError('');
                 notifyAppPlayerReady(true); // Notify App component

                // --- Get Duration ---
                try {
                    const duration = event.target.getDuration();
                    onDurationChange(duration); // Call the callback prop
                } catch(e) {
                    console.error("Error getting duration onReady:", e);
                    onDurationChange(0); // Report 0 if error
                }
                // --- End Get Duration ---


                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = setInterval(updateCaption, 300);
            };

            const onPlayerStateChangeCallback = (event) => {
                 // If duration wasn't available initially, try again on first play
                 if (event.data === window.YT.PlayerState.PLAYING && playerRef.current) {
                     try {
                         const currentDuration = playerRef.current.getDuration();
                         // Only update if it's different and positive
                         // This avoids unnecessary state updates in App.js
                         // We might need access to the App's current duration state here
                         // or trust App.js to handle redundant calls.
                         // Let's just call it again for simplicity.
                         onDurationChange(currentDuration);
                     } catch (e) { console.error("Error getting duration onStateChange:", e); }
                 }

                if (event.data === window.YT.PlayerState.PLAYING) {
                    if (!intervalRef.current) {
                        intervalRef.current = setInterval(updateCaption, 300);
                    }
                } else {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    if (event.data === window.YT.PlayerState.PAUSED) { updateCaption(); }
                    else if (event.data === window.YT.PlayerState.ENDED) { setActiveCaption(''); }
                }
            };

            const onPlayerErrorCallback = (event) => {
                setError(`YouTube Player Error: Code ${event.data}`);
                console.error("YouTube Player Error:", event.data);
                if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
                 onDurationChange(0); // Reset duration on error
                 notifyAppPlayerReady(false); // Notify App component
            };


            if (playerRef.current) {
                console.log("Destroying previous player instance");
                 try { playerRef.current.destroy(); } catch (e) {}
                playerRef.current = null;
                 if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            }

            console.log(`Creating YT.Player for videoId: ${videoId}`);
             try {
                 const playerElement = document.getElementById(YOUTUBE_PLAYER_CONTAINER_ID);
                 if (!playerElement) {
                     throw new Error(`Player container #${YOUTUBE_PLAYER_CONTAINER_ID} not found in DOM.`);
                 }

                 // Calculate responsive width/height if needed, or use fixed
                 const containerWidth = playerContainerRef.current.offsetWidth;
                 // Maintain a 16:9 aspect ratio
                 const playerHeight = containerWidth * (9 / 16);

                 const player = new window.YT.Player(YOUTUBE_PLAYER_CONTAINER_ID, {
                     // Use calculated dimensions or fixed ones
                     // height: String(Math.round(playerHeight)),
                     // width: String(containerWidth),
                     height: '390', // Or keep fixed for simplicity
                     width: '640', // Max width set on container
                     videoId: videoId,
                     playerVars: { 'playsinline': 1, 'autoplay': 0, 'controls': 1, 'modestbranding': 1, 'rel': 0 },
                     events: {
                         'onReady': onPlayerReadyCallback,
                         'onStateChange': onPlayerStateChangeCallback,
                         'onError': onPlayerErrorCallback
                     }
                 });
             } catch(e) {
                  console.error("Error creating YT.Player:", e);
                  setError(`Failed to initialize YouTube player: ${e.message}`);
                  onDurationChange(0);
                  notifyAppPlayerReady(false);
             }
        } else if (!videoId && videoSrc) {
             // Handle case where src is set but ID extraction failed before API check
             setError("Invalid YouTube URL or could not extract Video ID.");
             onDurationChange(0);
             notifyAppPlayerReady(false);
        }

        // Cleanup
        return () => {
            console.log("Cleanup: Destroying player and clearing interval");
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
               try { playerRef.current.destroy(); } catch (e) {}
            }
            playerRef.current = null;
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
            // Don't reset error here on unmount/change, keep it if it was a loading error
        };

    }, [isApiReady, videoId, updateCaption, onDurationChange, notifyAppPlayerReady]); // Add callbacks to dependencies


     useEffect(() => {
          setError(''); // Clear component-local error when src changes
          setActiveCaption('');
     },[videoSrc])


    // --- Rendering Logic ---

    if (!videoSrc) {
        return (
            <section className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center text-gray-500 mt-6">
                 Video preview will appear here once a URL is loaded.
            </section>
        );
    }


    return (
        <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">3. Video Preview</h2>
            {/* Container for the player and the caption overlay */}
            {/* Added aspect-video for responsive height based on width */}
            <div
                ref={playerContainerRef} // Add ref here
                className="relative w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden shadow-md aspect-video"
                // style={{ maxWidth: '640px' }} // Max width can control size too
            >
                 {/* Div where YouTube iframe is injected */}
                <div id={YOUTUBE_PLAYER_CONTAINER_ID} className="absolute top-0 left-0 w-full h-full">
                    {/* Show loading/error states directly inside the player area */}
                    {!isApiReady && videoId && <p className="absolute inset-0 flex items-center justify-center text-white bg-black/50">Loading YouTube API...</p>}
                    {error && <p className="absolute inset-0 flex items-center justify-center text-red-400 bg-black/80 p-4 text-center">{error}</p>}
                     {/* Placeholder while player loads after API is ready */}
                     {isApiReady && videoId && !error && !playerRef.current && <p className="absolute inset-0 flex items-center justify-center text-white bg-black/50">Initializing Player...</p>}
                </div>

                 {/* Caption overlay - positioned absolutely within the relative container */}
                 {/* Ensure it's visible even if player fails to load */}
                <div className={`absolute bottom-[12%] sm:bottom-[15%] left-0 w-full px-4 py-1 sm:px-6 sm:py-2 text-center transition-opacity duration-300 ${activeCaption ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
                   <span className="bg-black/70 text-white text-sm sm:text-base md:text-lg px-3 py-1 rounded">
                       {activeCaption}
                   </span>
                </div>
            </div>
        </section>
    );
}

export default VideoPlayer;
