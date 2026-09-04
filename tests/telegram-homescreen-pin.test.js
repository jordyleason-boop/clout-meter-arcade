const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
function has(snippet, label) {
  assert.ok(html.indexOf(snippet) !== -1, "missing " + label);
}

has("function promptTelegramHomeScreenShortcut", "homescreen prompt helper");
has("promptTelegramHomeScreenShortcut();", "called after viewport metrics");
has("webapp.isVersionAtLeast('8.0')", "Bot API 8.0+ gate");
has("webapp.onEvent('homeScreenChecked'", "official event listener");
has("eventData.status === 'missed' || eventData.status === 'unknown'", "status filter");
has("webapp.addToHomeScreen()", "native pin tray");
has("webapp.checkHomeScreenStatus();", "status poll without callback");
has("Home screen asset polling error wrapper:", "safe poll wrapper");
has("data-sdk=\"show_11716521\"", "Monetag hook preserved");
has("fetch(\"/api/user-state\"", "user-state route preserved");
assert.ok(html.indexOf("checkHomeScreenStatus((") === -1, "must not pass an inline callback to checkHomeScreenStatus");

const expandIdx = html.indexOf("webApp.enableVerticalSwipes();");
const pinIdx = html.indexOf("promptTelegramHomeScreenShortcut();");
const eventIdx = html.indexOf("webApp.onEvent(\"chatRequested\"");
assert.ok(expandIdx !== -1 && pinIdx !== -1 && eventIdx !== -1, "initTelegram markers present");
assert.ok(expandIdx < pinIdx && pinIdx < eventIdx, "pin prompt runs after viewport setup");

console.log("telegram-homescreen-pin tests passed");
