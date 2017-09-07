
browser.contextMenus.removeAll();

browser.contextMenus.create({
    title: "Reload GMail feed",
    contexts: ["browser_action"],
    onclick: () => checkGMail()
});

