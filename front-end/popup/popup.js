chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const goToButton = document.getElementById("go-to-button");
  const qaWorldLink = "https://app.qa-world.com/calls";

  goToButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ goToQaWorld: "go to qa world" });
  });

  if (tab.url === qaWorldLink) {
    goToButton.disabled = true;
  }
});
