const video = document.getElementById('webcam');
let warningCount = 0;
let lastDirection = "center";
let rejected = false;
async function enableWebcam() {
try {
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
video.srcObject = stream;
} catch (err) {
alert("Error accessing webcam: " + err.message);
}
}
window.onload = () => {
enableWebcam();
// MediaPipe FaceMesh setup
const faceMesh = new FaceMesh({
locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
maxNumFaces: 1,
refineLandmarks: true,
minDetectionConfidence: 0.5,
minTrackingConfidence: 0.5
});
faceMesh.onResults(results => {
if (results.multiFaceLandmarks.length > 0) {
const landmarks = results.multiFaceLandmarks[0];
const leftEye = landmarks[33];
const rightEye = landmarks[263];
const nose = landmarks[1];
const eyeCenterX = (leftEye.x + rightEye.x) / 2;
const diff = nose.x - eyeCenterX;
let currentDirection = "center";
if (diff > 0.03) currentDirection = "right";
else if (diff < -0.03) currentDirection = "left";
if ((currentDirection === "left" || currentDirection === "right") && currentDirection !==
lastDirection && !rejected) {
warningCount++;
if (warningCount === 1) {
alert("Warning 1: Please face forward.");
} else if (warningCount === 2) {
alert("Warning 2: Final warning!");
} else if (warningCount >= 3) {
alert("Disqualified due to suspicious behavior.");
rejected = true;
// optionally, stop webcam or redirect here
}
}
lastDirection = currentDirection;
}
});
const camera = new Camera(video, {
onFrame: async () => {
await faceMesh.send({ image: video });
},
width: 640,
height: 480
});
camera.start();
};