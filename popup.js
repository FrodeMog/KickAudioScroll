function saveOptions(e) {
    e.preventDefault();
    var increment = document.getElementById("increment").value;
    browser.storage.local.set({ "increment": increment });
    updateIncrement(increment);
}

function restoreOptions() {
    function setCurrentChoice(result) {
        document.getElementById("increment").value = result.increment || "0.02";
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
document.querySelector("form").addEventListener("submit", saveOptions);