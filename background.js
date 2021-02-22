const qaWorldLink = "https://app.qa-world.com/calls";
const actionLogStyle = "color: #34eb37";
const infoStyle = "color: #ea4dff";

const injectForegroundScript = () => {
  console.log("%cI'm looking for QA world's calls tab...", actionLogStyle);

  chrome.windows.getAll({}, (allWindows) => {
    allWindows.map((window) => {
      chrome.tabs.query({ windowId: window.id }, (allWindowTabs) => {
        allWindowTabs.map((tab) => {
          console.log("%cTab-URL: ", infoStyle, tab.url);
          if (tab.url === qaWorldLink) {
            console.log(
              "%cI'm checking if the script has already been injected...",
              actionLogStyle
            );

            chrome.tabs.executeScript(tab.id, {
              code: `
              try{
                console.log("transcriptDiv check on back-end ->", transcriptDiv)
              } catch (err) {
                if(err.message === "transcriptDiv is not defined") {
                  chrome.runtime.sendMessage({ injectScript: "inject the script" })
                }
                if(err.message === "Identifier 'transcriptDiv' has already been declared") {
                  chrome.runtime.sendMessage({ injectScript: "skip script injection" })
                }
              }
                    `,
            });

            chrome.runtime.onMessage.addListener(
              (message, sender, sendResponse) => {
                if (
                  message &&
                  message.injectScript &&
                  message.injectScript === "inject the script"
                ) {
                  console.log("%cI'm injecting the script...", actionLogStyle);
                  chrome.tabs.executeScript(
                    tab.id,
                    { file: "./front-end/checkForTranscripts.js" },
                    () => console.log("%cScript injected!", actionLogStyle)
                  );
                }

                if (
                  message &&
                  message.injectScript &&
                  message.injectScript === "skip script injection"
                ) {
                  console.log(
                    "%cI'm skipping script injection",
                    actionLogStyle
                  );
                  chrome.runtime.onMessage.removeListener();
                  return;
                }

                chrome.runtime.onMessage.removeListener();
              }
            );
          }
        });
      });
    });
  });
};

chrome.tabs.onCreated.addListener(() => {
  injectForegroundScript();
  chrome.tabs.onCreated.removeListener();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  injectForegroundScript();
  if (tab.url === qaWorldLink && changeInfo.status === "complete") {
    chrome.tabs.executeScript(tabId, {
      code: `console.log("%cIM HERE !!!", "color: #0394fc");`,
    });
  }

  chrome.tabs.onUpdated.removeListener();
});

chrome.tabs.onRemoved.addListener(() => {
  injectForegroundScript();
  chrome.tabs.onRemoved.removeListener();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.goToQaWorld && message.goToQaWorld === "go to qa world") {
    chrome.tabs.query({ url: qaWorldLink }, (tabsWithLink) => {
      console.log("tabs-with-qaworld-link->", tabsWithLink);
      if (tabsWithLink.length > 0) {
        chrome.windows.update(
          tabsWithLink[0].windowId,
          { focused: true },
          () => {
            chrome.tabs.update(tabsWithLink[0].id, { active: true });
          }
        );
      } else {
        chrome.tabs.create({ active: true, url: qaWorldLink });
      }
    });
  }

  if (message.notifyUser && message.notifyUser === "found link") {
    chrome.tabs.query({ url: qaWorldLink }, (qaWorldTabs) => {
      if (qaWorldTabs.length > 0) {
        chrome.windows.update(
          qaWorldTabs[0].windowId,
          { focused: true },
          () => {
            chrome.tabs.update(qaWorldTabs[0].id, { active: true });
          }
        );
      }
    });

    chrome.notifications.create({
      title: "Found Link!",
      message: " Found Best Link For You!",
      iconUrl: "./notification-logo.png",
      type: "basic",
      silent: false,
    });
  }

  chrome.runtime.onMessage.removeListener();
});
