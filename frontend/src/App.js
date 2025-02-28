// import { useState, useRef } from "react";

// function App() {
//   const [videos, setVideos] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [error, setError] = useState(null);
//   const videoRef = useRef(null);

//   const fetchVideos = async () => {
//     setError(null);
//     setCurrentIndex(0); // Reset index when fetching new videos
//     try {
//       const response = await fetch("http://localhost:5000/api/speech-to-video");
//       const data = await response.json();

//       if (response.ok) {
//         setVideos(data.videos);
//       } else {
//         setError(data.error || "Error fetching videos");
//       }
//     } catch (err) {
//       setError("Failed to fetch data. Is the backend running?");
//     }
//   };

//   const handleVideoEnd = () => {
//     if (currentIndex < videos.length - 1) {
//       setCurrentIndex((prevIndex) => prevIndex + 1);
//     }
//   };

//   return (
//     <div>
//       <h1>ASL Translator</h1>
//       <button onClick={fetchVideos}>🎤 Speak & Translate</button>

//       {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

//       {videos.length > 0 && (
//         <div>
//           <h2>🎥 Playing ASL Videos</h2>
//           <video
//             ref={videoRef}
//             src={videos[currentIndex]}
//             controls
//             autoPlay
//             width="400"
//             onEnded={handleVideoEnd} // Play next video when the current one ends
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
import React, { useState } from "react";

const App = () => {
  const [text, setText] = useState("");
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const startSpeechRecognition = () => {
    setError(null);
    setVideos([]);
    setCurrentIndex(0);

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = async (event) => {
      const speechText = event.results[0][0].transcript;
      setText(speechText);
      console.log("Recognized Text:", speechText);

      // Send text to backend
      try {
        const response = await fetch(
          "http://localhost:5000/api/speech-to-video",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: speechText }),
          }
        );

        const data = await response.json();
        console.log("Backend Response:", data);

        if (response.ok && data.videos.length > 0) {
          setVideos(data.videos);
        } else {
          setError(data.error || "No matching videos found.");
        }
      } catch (err) {
        setError("Failed to fetch data.");
      }
    };

    recognition.onerror = (event) => {
      setError("Speech recognition error: " + event.error);
    };
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🎤 ASL Translator</h1>
      <button
        onClick={startSpeechRecognition}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Speak & Translate
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {videos.length > 0 && (
        <div>
          <video
            key={videos[currentIndex]}
            src={videos[currentIndex]}
            controls
            autoPlay
            style={{ marginTop: "20px", maxWidth: "80%" }}
          ></video>
          {currentIndex < videos.length - 1 && (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}
            >
              Next Video
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
