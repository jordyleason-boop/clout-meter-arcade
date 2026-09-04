const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
function has(snippet, label) {
  assert.ok(html.indexOf(snippet) !== -1, "missing " + label);
}

has("function promptTelegramHomeScreenShortcut", "homescreen prompt helper");
has("promptTelegramHomeScreenShortcut();", "called after viewport metrics");
has("window.Telegram.WebApp.isVersionAtLeast('7.0')", "version gate");
has("window.Telegram.WebApp.checkHomeScreenStatus", "duplicate-pin guard");
has("status === 'unsupported' || status === 'missed'", "status filter");
has("window.Telegram.WebApp.addToHomeScreen()", "native pin tray");
has("data-sdk=\"show_11716521\"", "Monetag hook preserved");
has("fetch(\"/api/user-state\"", "user-state route preserved");

const expandIdx = html.indexOf("webApp.enableVerticalSwipes();");
const pinIdx = html.indexOf("promptTelegramHomeScreenShortcut();");
const eventIdx = html.indexOf("webApp.onEvent(\"chatRequested\"");
assert.ok(expandIdx !== -1 && pinIdx !== -1 && eventIdx !== -1, "initTelegram markers present");
assert.ok(expandIdx < pinIdx && pinIdx < eventIdx, "pin prompt runs after viewport setup");

console.log("telegram-homescreen-pin tests passed");
