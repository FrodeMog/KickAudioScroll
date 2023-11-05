let currentIncrement = 0.02; 
let debugMode = false;
let playerFound = false;
let currentUrl = document.location.href;
let observer;

const debugMessage = (message, debugModeOverwrite) => {
  if (debugMode || debugModeOverwrite){
    console.log(`%c[TwitchAudioScroll] %c[DEBUG] %c${message}`, 'color: #00e701; font-weight: bold;', 'color: #2bd9de; font-weight: bold;', 'color: initial;');
  }
};

// Then you can use the unmutePlayer function
const unmutePlayer = (player) => {
  debugMessage("played muted: " + player.muted);
  if(player){     
    if (player.muted) {
      debugMessage("Unmuting player.", true);
      player.muted = false;
    } else {
      debugMessage("Player is already unmuted.");
    }
  }
};

const isMouseOverPlayer = (event, player) => {
  const rect = player.getBoundingClientRect();
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  return (
    mouseX >= rect.left &&
    mouseX <= rect.right &&
    mouseY >= rect.top &&
    mouseY <= rect.bottom
  );
};

const startVolumeControl = (player) => {
  player.style.pointerEvents = "none";

  const preventScroll = (event) => {
    if (isMouseOverPlayer(event, player)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  document.addEventListener('wheel', preventScroll, { passive: false });
  document.addEventListener('touchmove', preventScroll, { passive: false });
  
  document.addEventListener('wheel', (event) => {
    if (isMouseOverPlayer(event, player)) {
        if (event.deltaY < 0) {
            if (player.volume < 1) {
            const newVolume = Math.min(1, player.volume + currentIncrement);
            unmutePlayer(player);
            setVolume(player, newVolume);
            }
        } else {
            if (player.volume > 0) {
            const newVolume = Math.max(0, player.volume - currentIncrement);
            setVolume(player, newVolume);
            }
        }
    }});
};

const setVolume = (player, rawVolume) => {
  const volume = Math.round(rawVolume * 100) / 100;
  player.volume = volume;
  const event = new Event('volumechange');
  player.dispatchEvent(event);

  const volumeBar = document.querySelector('.vjs-volume-level');
  if (volumeBar) {
      volumeBar.style.height = `${volume * 100}%`;
  }

  const volumeControlButton = document.querySelector('.vjs-mute-control');
  if (volumeControlButton) {
      let levelClass = '';
      if (volume === 0) {
          levelClass = 'vjs-vol-0';
      } else if (volume >= 0 && volume < 0.34) {
          levelClass = 'vjs-vol-1';
      } else if (volume >= 0.34 && volume < 0.67) {
          levelClass = 'vjs-vol-2';
      } else if (volume >= 0.67 && volume <= 1) {
          levelClass = 'vjs-vol-3';
      }
      debugMessage(levelClass);
      debugMessage(volume);

      requestAnimationFrame(() => {
          volumeControlButton.classList = 'vjs-mute-control vjs-control vjs-button';
          volumeControlButton.classList.add(levelClass);
      });
  }
};

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "incrementUpdate") {
      currentIncrement = parseFloat(message.increment) || currentIncrement;
    }
});

const checkForPlayer = () => {
  debugMessage("Checking for Kick player...");
  const player = document.querySelector('video[playsinline][webkit-playsinline][src^="blob:https://kick.com"]');
  if (player) {
    if (!playerFound) {
      debugMessage("Kick player found.", true);
      startVolumeControl(player);
      browser.storage.local.get("increment").then((result) => {
        currentIncrement = parseFloat(result.increment) || 0.02;
      });
      playerFound = true;
      if (observer) {
        observer.disconnect();
      }
    }
  } else {
    playerFound = false;
    debugMessage("Kick player not found.");
  }
};

const startObserver = () => {
  if (observer) {
    observer.disconnect();
  }
  const mainView = document.getElementById('main-view');
  if (mainView) {
    debugMessage("Element with id 'main-view' found. Starting observer.", true);
    observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === 'childList' &&
          mutation.addedNodes.length > 0 &&
          mutation.target.nodeName.toLowerCase() !== 'script'
        ) {
          debugMessage("Mutation detected. Checking for player.");
          checkForPlayer();
        }
      }
    });
    observer.observe(mainView, { childList: true, subtree: true });
  } else {
    debugMessage("Element with id 'main-view' not found. Trying again in 1000 milliseconds.", true);
    setTimeout(startObserver, 1000);
  }
};

const checkUrlChange = () => {
  const newUrl = document.location.href;
  if (newUrl !== currentUrl) {
    currentUrl = newUrl;
    playerFound = false; // Reset playerFound on URL change
    startObserver();
  }
  requestAnimationFrame(checkUrlChange);
};

startObserver();
checkUrlChange();
