let previousVolume = 0; // Variable to store the previous volume
let currentIncrement = 0.02; // default value for audio increase increment

//Listen for updates to the increment value from the popup.js
browser.runtime.onMessage.addListener((message) => {
    if (message.type === "incrementUpdate") {
      currentIncrement = parseFloat(message.increment) || currentIncrement;
    }
});

// Function to check for the Kick player with a short delay
const checkForPlayer = () => {
  const player = document.querySelector('video[playsinline][webkit-playsinline][src^="blob:https://kick.com"]');
  if (player) {
    console.log("Kick player found.");
    startVolumeControl(player);
    browser.storage.local.get("increment").then((result) => {
        currentIncrement = parseFloat(result.increment) || 0.02;
    });
  } else {
    console.log("Kick player not found. Retrying in 500ms.");
    setTimeout(checkForPlayer, 500); // Retry after 500ms
  }
};

// Start checking for the player
checkForPlayer();

//Start volume control once the player is found
const startVolumeControl = (player) => {
  // Disable pointer events on the player element
  player.style.pointerEvents = "none";

  // Function to prevent scrolling on the website when the mouse is over the player
  const preventScroll = (event) => {
    if (isMouseOverPlayer(event, player)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // Add event listeners to prevent scrolling
  document.addEventListener('wheel', preventScroll, { passive: false });
  document.addEventListener('touchmove', preventScroll, { passive: false });

  document.addEventListener('wheel', (event) => {
    // Adjust volume based on mousewheel direction
    if (isMouseOverPlayer(event, player)) {
        if (event.deltaY < 0) {
            // Increase volume scrolling up
            if (player.volume < 1) {
            const newVolume = Math.min(1, player.volume + currentIncrement);
            unmutePlayer(player); //Unmute when scrolling up
            setVolume(player, newVolume);
            //console.log("Volume increased:", newVolume.toFixed(3));
            }
        } else {
            // Decrease volume scrolling down
            if (player.volume > 0) {
            const newVolume = Math.max(0, player.volume - currentIncrement);
            setVolume(player, newVolume);
            //console.log("Volume decreased:", newVolume.toFixed(3));
            }
        }
    }});
};

// Function to set the volume of the player element
const setVolume = (player, volume) => {
    player.volume = volume;
    const event = new Event('volumechange');
    player.dispatchEvent(event);
  
    //Change the height of the volume bar
    const volumeBar = document.querySelector('.vjs-volume-level');
    if (volumeBar) {
      volumeBar.style.height = `${volume * 100}%`;
    }
  
    //Change the icon of the volume control button
    const volumeControlButton = document.querySelector('.vjs-mute-control');
    if (volumeControlButton) {
      let levelClass = '';
      if (volume === 0) {
        levelClass = 'vjs-vol-0';
      } else if (volume > 0 && volume < 0.34) {
        levelClass = 'vjs-vol-1';
      } else if (volume >= 0.34 && volume < 0.67) {
        levelClass = 'vjs-vol-2';
      } else if (volume >= 0.67) {
        levelClass = 'vjs-vol-3';
      }
      setTimeout(() => { //Weird delay needed to make the volume icon change, still buggy
        volumeControlButton.setAttribute('class', `vjs-mute-control vjs-control vjs-button ${levelClass}`);
      }, 50);
    }
  };
  
const unmutePlayer = (player) => {
  if (player.muted) {
    player.volume = 0; // Set the volume to 0 before unmuting to avoid a sudden increase in volume
    player.muted = false;
    const event = new Event('volumechange');
    player.dispatchEvent(event);
  } else {
    previousVolume = player.volume; //Store the current volume before muting (doesnt work - audio spikes)
  }
};

// Function to check if the mouse is over the player
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
