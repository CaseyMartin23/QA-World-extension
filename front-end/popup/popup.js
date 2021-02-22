chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const qaWorldLink = "https://app.qa-world.com/calls";

  const goToButton = document.getElementById("go-to-button");
  const startStopButton = document.getElementById("start-stop-button");
  const loadingMessage = document.getElementById("loading-info");
  const stoppedMessage = document.getElementById("search-stop-info");
  const wrongPageMessage = document.getElementById("wrong-page-info");

  chrome.storage.local.get(["searchButtonState"], (searchState) => {
    console.log("searchButtonState->", searchState);

    if (
      !searchState.searchButtonState ||
      searchState.searchButtonState === "stopped"
    ) {
      startStopButton.style.backgroundColor = "#45f714";
      startStopButton.style.borderColor = "#45f714";
      startStopButton.style.color = "#23384c";
      startStopButton.innerText = "Start search";

      stoppedMessage.style.display = "block";
      loadingMessage.style.display = "none";
    }
    if (searchState.searchButtonState === "started") {
      startStopButton.style.backgroundColor = "#fa0000";
      startStopButton.style.borderColor = "#fa0000";
      startStopButton.style.color = "#ffffff";
      startStopButton.innerText = "Stop search";

      stoppedMessage.style.display = "none";
      loadingMessage.style.display = "block";
    }
  });

  goToButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ goToQaWorld: "go to qa world" });
  });

  startStopButton.addEventListener("click", () => {
    const buttonText = startStopButton.innerText;
    if (
      buttonText &&
      buttonText === "Start search" &&
      tab.url === qaWorldLink
    ) {
      chrome.tabs.sendMessage(tab.id, { startSearch: "start" });
      chrome.storage.local.set({ searchButtonState: "started" });

      startStopButton.style.backgroundColor = "#fa0000";
      startStopButton.style.borderColor = "#fa0000";
      startStopButton.style.color = "#ffffff";
      startStopButton.innerText = "Stop search";

      stoppedMessage.style.display = "none";
      loadingMessage.style.display = "block";
    } else {
      chrome.tabs.sendMessage(tab.id, { startSearch: "stop" });
      chrome.storage.local.set({ searchButtonState: "stopped" });

      startStopButton.style.backgroundColor = "#45f714";
      startStopButton.style.borderColor = "#45f714";
      startStopButton.style.color = "#23384c";
      startStopButton.innerText = "Start search";

      stoppedMessage.style.display = "block";
      loadingMessage.style.display = "none";
    }
  });

  if (tab.url === qaWorldLink) {
    goToButton.disabled = true;
    startStopButton.disabled = false;

    wrongPageMessage.style.display = "none";
  }
});
