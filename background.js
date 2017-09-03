
const GMAIL_HOME = "https://mail.google.com/mail/u/0/#inbox";

var gmail = {
    url:GMAIL_HOME,
    last_count: 0,
    links: []
};

browser.browserAction.onClicked.addListener(openGMail);

let alarm = browser.alarms.create({periodInMinutes: 1});
browser.alarms.onAlarm.addListener(alarm => checkGMail());
checkGMail();

function checkGMail () {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
        console.log(xhr.responseXML);
        let d = xhr.responseXML;
        let fullcount = Number(d.getElementsByTagName("fullcount")[0].innerHTML);
	gmail.links = fullcount > 0 ? Array.from(d.getElementsByTagName("entry")).map(entry => entry.getElementsByTagName("link")[0].getAttribute("href")) : [];
        updateButton(fullcount, gmail.links.shift() || GMAIL_HOME);
    });
    xhr.addEventListener("error", (x) => console.log("xhr error: ", x, browser.runtime.lastError. xhr));
    xhr.open("GET", "https://mail.google.com/mail/u/0/feed/atom");
    xhr.send();
}

function updateButton(count, link) {
    gmail.last_count = count;
    if (count > 0) {
        browser.browserAction.setIcon({path:"icons/gmail-64-unread.png"});
        browser.browserAction.setBadgeText({text:count.toString()});
        gmail.url = link;
    } else {
        browser.browserAction.setIcon({path:"icons/gmail-64.png"});
        browser.browserAction.setBadgeText({text:""});
	gmail.url = GMAIL_HOME;
    }
}


async function openGMail() {
  console.log("open gmail: querying tabs");
  var tabs = await browser.tabs.query({url:"*://mail.google.com/mail/*"});
  console.log("found tabs", tabs);
  if (tabs.length === 0) {
    await browser.tabs.create({
      url: gmail.url
    });
  } else {
    await browser.tabs.update(tabs[0].id, {url:gmail.url, active:true});
  }
  updateButton(--gmail.last_count, gmail.links.shift() || GMAIL_HOME);
  console.log("open gmail done");
}

// ctx menus
browser.contextMenus.removeAll();
browser.contextMenus.create({
    title: "Reload GMail feed",
    contexts: ["browser_action"],
    onclick: () => checkGMail()
});
