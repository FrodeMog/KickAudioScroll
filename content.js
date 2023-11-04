let previousVolume = 0; // Variable to store the previous volume

// Function to check for the Kick player with a short delay
const checkForPlayer = () => {
  const player = document.querySelector('video[playsinline][webkit-playsinline][src^="blob:https://kick.com"]');
  if (player) {
    console.log("Kick player found.");
    unmutePlayer(player); // Call the unmutePlayer function
    startVolumeControl(player);
  } else {
    console.log("Kick player not found. Retrying in 500ms.");
    setTimeout(checkForPlayer, 500); // Retry after 500ms
  }
};

// Start checking for the player
checkForPlayer();

// Function to start volume control once the player is found
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
        // Increase volume within bounds
        if (player.volume < 1) {
          const newVolume = Math.min(1, player.volume + 0.02);
          unmutePlayer(player);
          setVolume(player, newVolume);
          console.log("Volume increased:", newVolume.toFixed(3));
        }
      } else {
        // Decrease volume within bounds
        if (player.volume > 0) {
          const newVolume = Math.max(0, player.volume - 0.02);
          setVolume(player, newVolume);
          console.log("Volume decreased:", newVolume.toFixed(3));
        }
      }
    }
  });
};

// Function to set the volume of the player element
const setVolume = (player, volume) => {
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
      } else if (volume > 0 && volume < 0.34) {
        levelClass = 'vjs-vol-1';
      } else if (volume >= 0.34 && volume < 0.67) {
        levelClass = 'vjs-vol-2';
      } else if (volume >= 0.67) {
        levelClass = 'vjs-vol-3';
      }
      setTimeout(() => {
        volumeControlButton.setAttribute('class', `vjs-mute-control vjs-control vjs-button ${levelClass}`);
      }, 50); // Adjust the delay time (in milliseconds) as needed
    }
  };
  
const unmutePlayer = (player) => {
  if (player.muted) {
    player.volume = 0; // Set the volume to 0 before unmuting
    player.muted = false;
    const event = new Event('volumechange');
    player.dispatchEvent(event);
  } else {
    previousVolume = player.volume; // Store the current volume before muting
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
