function saveOptions(e) {
    e.preventDefault();
    var increment = document.getElementById("increment").value;
    browser.storage.local.set({ "increment": increment });
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

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);