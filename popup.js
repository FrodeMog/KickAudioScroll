function saveOptions() {
    var increment = document.getElementById("increment").value;
    browser.storage.local.set({ "increment": increment });
    document.getElementById('sliderValue').innerText = increment;
    updateIncrement(increment);
  }
  
  function restoreOptions() {
    function setCurrentChoice(result) {
      let currentIncrement = result.increment || "0.02";
      document.getElementById("increment").value = currentIncrement;
      document.getElementById('sliderValue').innerText = currentIncrement;
      updateIncrement(currentIncrement);
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.local.get("increment").then(setCurrentChoice).catch(onError);
  }
  
  function updateIncrement(newValue) {
    browser.storage.local.set({ "increment": newValue });
  
    // Send a message to content.js to notify it of the updated increment value
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id, { type: "incrementUpdate", increment: newValue });
    });
  }
  
  document.addEventListener("DOMContentLoaded", restoreOptions);
  
  document.getElementById("increment").addEventListener("input", saveOptions);
  