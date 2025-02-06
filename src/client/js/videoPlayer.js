const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeOut = null;
let controlsMovementTimeOut = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (event) => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (event) => {
    if (video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted
        ? "fas fa-volume-mute"
        : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
    const {
        target: { value },
    } = event;
    if (video.muted) {
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    volumeValue = value;
    video.volume = value;
};

const formatTime = (seconds) => {
    return new Date(seconds * 1000).toISOString().substring(14, 19);
};

const handleLoadedMetaData = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
    const {
        target: { value },
    } = event;
    video.currentTime = value;
};

const handleFullScreen = () => {
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    } else {
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    }
};

const hideControls = () => {
    videoControls.classList.remove("showing");
};

const handleMouseMove = () => {
    if (controlsTimeOut) {
        clearTimeout(controlsTimeOut);
        controlsTimeOut = null;
    }
    if (controlsMovementTimeOut) {
        clearTimeout(controlsMovementTimeOut);
        controlsMovementTimeOut = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeOut = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
    controlsTimeOut = setTimeout(hideControls, 3000);
};

if (video.readyState >= 0) {
    handleLoadedMetaData();
}

video.addEventListener("loadeddata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
