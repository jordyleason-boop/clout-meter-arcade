const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { resolveArcadeDisplayHandle, sanitizeHandle } = require("../server.js");

assert.strictEqual(resolveArcadeDisplayHandle({ username: "Medixineman" }, {}), "Medixineman");
assert.strictEqual(resolveArcadeDisplayHandle({ username: "", first_name: "Medi" }, {}), "Medi");
assert.strictEqual(resolveArcadeDisplayHandle({ first_name: "John Doe" }, {}), "JohnDoe");
assert.strictEqual(resolveArcadeDisplayHandle({}, { username: "", handle: "", first_name: "Arcade Kid" }), "ArcadeKid");
assert.strictEqual(resolveArcadeDisplayHandle({ username: "   " }, {}), "ArcadePlayer");
assert.strictEqual(resolveArcadeDisplayHandle({}, { handle: "test_user_99" }), "test_user_99");
assert.strictEqual(sanitizeHandle("@PrivateFan"), "PrivateFan");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
function has(snippet, label) {
  assert.ok(html.indexOf(snippet) !== -1, "missing " + label);
}

has("let rawUsername = \"EMPTY\"", "rawUsername fallback seed");
has("const tgUserObj = window.Telegram.WebApp.initDataUnsafe.user;", "Telegram user object");
has("tgUserObj.first_name ? String(tgUserObj.first_name).trim() : \"ArcadePlayer\"", "first_name to ArcadePlayer fallback");
has("fetch(\"/api/user-state\"", "user-state sync");
has("username: arcadeIdentitySyncFields().username", "username payload mapping");
has("handle: arcadeIdentitySyncFields().handle", "handle payload mapping");
has("first_name: arcadeIdentitySyncFields().first_name", "first_name payload mapping");
has("data-sdk=\"show_11716521\"", "Monetag zone");
has("data-zone=\"11716521\"", "Monetag zone id");
has("function isolateMonetagRedirectBounds", "Monetag frame bridge");
has("Monetag isolated frame bridge initialized.", "Monetag bridge log");
has("try_instant_view: false", "Telegram external browser sheet");
has("window.__monetagAdSessionActive = true", "ad session guard");
assert.ok(!/data-zone="(?!11716521)\d+"/.test(html), "Monetag zone must stay 11716521");

console.log("arcade-identity-monetag tests passed");
