const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
function has(snippet, label) {
  assert.ok(html.indexOf(snippet) !== -1, "missing " + label);
}

has("id=\"instant-self-roast-btn\"", "home dashboard instant roast button");
has("onclick=\"executeImmediateSelfRoast()\"", "home CTA click handler");
has("1-CLICK INSTANT LAUNCH: ROAST MY OWN PROFILE NOW", "home CTA label");
has("function executeImmediateSelfRoast()", "instant roast handler");
has("openModule(\"roaster\")", "navigates into Profile Roaster");
has("function openModule(moduleId)", "openModule alias");
has("window.executeImmediateSelfRoast = executeImmediateSelfRoast", "global handler");
has("id=\"hub-grid\"", "module grid preserved");
has("data-hub=\"profile_roaster\"", "Profile Roaster card preserved");
has("data-hub=\"aura_judge\"", "Aura Judge card preserved");
has("data-sdk=\"show_11716521\"", "Monetag hook preserved");
has("id=\"scan-me-btn\"", "interior Scan Myself shortcut preserved");

const ctaIdx = html.indexOf("id=\"instant-self-roast-btn\"");
const gridIdx = html.indexOf("id=\"hub-grid\"");
assert.ok(ctaIdx !== -1 && gridIdx !== -1 && ctaIdx < gridIdx, "home CTA sits above the module grid");

console.log("instant-self-roast-home tests passed");
