export default function decorate(block) {
  const container = document.querySelector(
    ".top-video-text-overlay-and-button-container"
  );

  const script = document.createElement("script");

  script.src =
    "https://players.brightcove.net/1852113022001/g2OtgoAoBs_default/index.min.js";

  container.append(script);
  container.style.padding = "0px";
  let desktopVideo = videoInit(container.dataset.videoId, 'desktop-video')
  let mobileVideo = videoInit(container.dataset.mobileVideoId, 'mobile-video')
  container.appendChild(desktopVideo);
  container.appendChild(mobileVideo);

  const control = document.createElement("div");
  control.className = "pause";
  container.prepend(control);

  let firstButton = container.querySelector(".button-container:first-child a");
  firstButton.classList.remove("button");
  firstButton.classList.add("text-white");

  let cta = container.querySelector(".top-video-text-overlay-and-button a");
  cta.classList.add("cta");
  cta.closest('div').classList.add("cta-wrapper");
  const player = document.querySelector("video-js");

  player.addEventListener("click", (e) => {
    const isPaused = e.target.parentElement.classList.contains("vjs-paused");
    let control = document.querySelector(
      ".top-video-text-overlay-and-button-container > div"
    );

    if (!isPaused) {
      control.classList.remove("pause");
      control.classList.add("play");
      return;
    }

    control.classList.remove("play");
    control.classList.add("pause");
  });
}

function videoInit(videoId, classes) {

  const videoWrapper = document.createElement("div");
  videoWrapper.classList.add('video-wrapper')
  videoWrapper.classList.add(classes)
  const video = document.createElement("video-js");

  video.setAttribute("data-account", "1852113022001");
  video.setAttribute("data-player", "g2OtgoAoBs");
  video.setAttribute("data-embed", "default");
  video.setAttribute("controls", "");
  video.setAttribute("autoplay", true);
  video.setAttribute("loop", true);
  video.setAttribute("muted", true);
  video.setAttribute("preload", true);
  video.setAttribute("data-video-id", videoId);
  video.setAttribute("data-playlist-id", "");
  video.setAttribute("data-application-id", "");

  // video.style.width = "100%";
  // video.style.height = "550px";
  // video.style.objectFit = "cover";

  videoWrapper.appendChild(video);

  return videoWrapper;
}
