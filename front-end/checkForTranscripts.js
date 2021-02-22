try {
  const transcriptDiv = document.getElementsByClassName("container-md")[0]
    .children[2].children[0].children[0].children[0];

  let searchIntervalId = null;

  const fakeLink = document.createElement("a");
  fakeLink.href =
    "https://www.google.com/search?q=color+picker&oq=color+p&aqs=chrome.0.69i59j69i57j0j0i20i263j46j0l3.6341j0j7&sourceid=chrome&ie=UTF-8";
  document.body.appendChild(fakeLink);

  const getBestLink = () => {
    const allTableRows = Array.from(transcriptDiv.getElementsByTagName("tr"));
    let highestTime = 0;
    let highestTimeLinkIndex = 0;

    allTableRows.shift();
    allTableRows.map((element, index) => {
      const linkTime = parseFloat(element.children[2].innerHTML.split(" ")[0]);

      console.log("%ctr: ", "color: #fc03f4", element.outerHTML);
      console.log("linkTime->", linkTime);

      if (highestTime < linkTime) {
        highestTime = linkTime;
        highestTimeLinkIndex = index;
      }
    });

    const bestLink = allTableRows[highestTimeLinkIndex].children[0].children[0];

    console.log("%cHighestLinkTime: ", "color: #ffdd00", highestTime);
    console.log(
      "%cNumber of Links:",
      "color: #00ffdd",
      Array.from(transcriptDiv.querySelectorAll("a[id^='queue-']")).length
    );

    console.log("%chighestTimeLink->", "color: #ffdd00", bestLink.outerHTML);

    if (searchIntervalId) {
      chrome.runtime.sendMessage({ notifyUser: "found link" });

      clearInterval(searchIntervalId);
      chrome.storage.local.set({ searchButtonState: "stopped" });
    }

    bestLink.click();
    // fakeLink.click();
  };

  const isTranscriptsAvailable = () => {
    const noTranscrpits =
      '<div class="card-body"><h1 class="large">Transcripts Available to Edit</h1><p>There are no calls at this time, please check back later.</p></div>';

    console.log("%cChecking for Transcriptions...", "color: #34eb37");

    if (transcriptDiv.outerHTML !== noTranscrpits) {
      console.log("transcriptDiv->", transcriptDiv.outerHTML);

      getBestLink();
    }
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.startSearch) {
      if (message.startSearch === "start") {
        searchIntervalId = setInterval(isTranscriptsAvailable, 2000);
      } else {
        clearInterval(searchIntervalId);
        searchIntervalId = null;
      }
    }
  });
} catch (err) {
  console.error(err.message);
}
