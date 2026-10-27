
import { useEffect, useRef, useState } from "react";

export default function LiveWorkoutCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [status, setStatus] = useState("Camera is stopped");
  const [error, setError] = useState("");

  async function startCamera() {
    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is unavailable. Open the app using localhost or HTTPS."
        );
      }

      setStatus("Requesting camera permission...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOn(true);
      setStatus("Camera is running. Video feed is active.");
    } catch (err) {
      setCameraOn(false);

      const message =
        err.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser settings."
          : err.name === "NotFoundError"
          ? "No webcam was found. Connect or enable a camera."
          : err.name === "NotReadableError"
          ? "The webcam may be in use by another application."
          : err.message || "Unable to start the webcam.";

      setError(message);
      setStatus("Camera could not start.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setStatus("Camera is stopped");
    setError("");
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <section
      style={{
        marginTop: "24px",
        padding: "20px",
        borderRadius: "16px",
        background: "#151923",
        color: "#ffffff",
        border: "1px solid #303747",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Live AI Workout Tracking</h2>

      <p style={{ color: "#b9c2d0" }}>
        Step 1: Start your webcam and check the live video feed.
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          aspectRatio: "4 / 3",
          background: "#080a0f",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <p role="status" style={{ color: "#9ee6b8" }}>
        {status}
      </p>

      {error && (
        <p role="alert" style={{ color: "#ff8585" }}>
          {error}
        </p>
      )}

      {!cameraOn ? (
        <button
          type="button"
          onClick={startCamera}
          style={{
            padding: "12px 20px",
            border: 0,
            borderRadius: "8px",
            background: "#38bdf8",
            color: "#07111c",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Start Webcam Workout
        </button>
      ) : (
        <button
          type="button"
          onClick={stopCamera}
          style={{
            padding: "12px 20px",
            border: 0,
            borderRadius: "8px",
            background: "#ff6b80",
            color: "#1b0a0e",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Stop Webcam
        </button>
      )}

      <p style={{ color: "#b9c2d0", fontSize: "13px" }}>
        Camera test only: AI pose detection and repetition counting are not
        enabled in this version yet.
      </p>
    </section>
  );
}
