const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
function has(snippet, label) {
  assert.ok(html.indexOf(snippet) !== -1, "missing " + label);
}

has("id=\"scan-me-btn\"", "Scan Myself button");
has("onclick=\"executeSelfScan()\"", "Scan Myself click handler");
has("⚡ QUICK SCAN MYSELF", "Scan Myself label");
has("function executeSelfScan()", "executeSelfScan routine");
has("window.executeSelfScan = executeSelfScan", "global executeSelfScan");
has("const selfUsername = window.Telegram.WebApp.initDataUnsafe.user.username", "username identity");
has("const selfFirstName = window.Telegram.WebApp.initDataUnsafe.user.first_name", "first_name fallback");
has("lockTargetOrWatchAd()", "existing scan submit wiring");
has("id=\"target-input\"", "target input preserved");
has("data-sdk=\"show_11716521\"", "Monetag hook preserved");
has("html2canvas", "receipt capture preserved");
assert.ok(html.indexOf("id=\"scan-me-btn\"") < html.indexOf("id=\"insider-gossip\""), "shortcut sits with the target field");

const inputIdx = html.indexOf("id=\"target-input\"");
const btnIdx = html.indexOf("id=\"scan-me-btn\"");
assert.ok(inputIdx !== -1 && btnIdx !== -1 && inputIdx < btnIdx, "button is next to the username input");

console.log("scan-myself-shortcut tests passed");
