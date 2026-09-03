const assert = require("assert");
const {
  parseAndValidateModuleJson,
  salvageLabeledRoastPayload,
  trimFinalVerdictSection,
  compileUserPrompt,
  APP_MODULES
} = require("../server.js");

const moduleConfig = APP_MODULES.profile_roaster;
assert.ok(moduleConfig, "profile_roaster config must load");

const labeled = [
  "Brutal oneliner",
  "Medixineman is a walking loading screen with a username.",
  "",
  "Vibe matrix",
  "The energy here is a buffering spinner that learned to talk.",
  "",
  "Bio annihilation",
  "No bio, no lore, just a handle hoping the algorithm does the personality work. This is a blank canvas that still asked to be roasted.",
  "",
  "Final verdict",
  "Anonymous by design, memorable by accident.",
  "METRICS_MATRIX[CHARISMA: 4, CRINGE: 7, THREAT: 2]"
].join("\n");

const salvaged = salvageLabeledRoastPayload(labeled);
assert.ok(salvaged, "labeled roast must salvage");
assert.match(salvaged.brutal_oneliner, /Medixineman/);
assert.match(salvaged.vibe_matrix, /buffering spinner/i);
assert.match(salvaged.bio_annihilation, /No bio/);
assert.match(salvaged.final_verdict, /Anonymous by design/);
assert.strictEqual(salvaged.clout_metrics.charisma_level, 4);

const labeledParsed = parseAndValidateModuleJson(labeled, moduleConfig, "Medixineman", "Medixineman");
assert.strictEqual(labeledParsed.ok, true, "labeled roast must parse as a valid module payload");
assert.match(labeledParsed.data.brutal_oneliner, /Medixineman/);
assert.match(labeledParsed.data.final_verdict, /Anonymous by design/);

const jsonPayload = JSON.stringify({
  brutal_oneliner: "Medixineman is a username with the charisma of a muted notification.",
  vibe_matrix: "Soft beige energy with a loading-bar soul.",
  bio_annihilation: "The bio is empty, which is brave in a loud way. This is a profile that outsourced personality to the handle.",
  final_verdict: "A blank badge that still wanted a scan.",
  clout_metrics: { charisma_level: 3, cringe_factor: 8, threat_multiplier: 2 }
});
const jsonParsed = parseAndValidateModuleJson(jsonPayload, moduleConfig, "Medixineman", "Medixineman");
assert.strictEqual(jsonParsed.ok, true, "canonical JSON must parse");
assert.match(jsonParsed.data.brutal_oneliner, /muted notification/);

const titledJson = JSON.stringify({
  "Brutal oneliner": "Handle so generic it needs a search party.",
  "Vibe matrix": "Clinic-core energy, zero plot.",
  "Bio annihilation": "Nothing in the bio except the sound of a cursor blinking. The gossip never arrived, so the void did the talking.",
  "Final verdict": "A quiet profile with a loud request."
});
assert.ok(trimFinalVerdictSection(titledJson).startsWith("{"), "JSON with Final verdict key must not be chopped");
const titledParsed = parseAndValidateModuleJson(titledJson, moduleConfig, "Medixineman", "Medixineman");
assert.strictEqual(titledParsed.ok, true, "title-case JSON keys must alias into the schema");
assert.match(titledParsed.data.brutal_oneliner, /search party/);
assert.match(titledParsed.data.final_verdict, /quiet profile/);

const garbage = parseAndValidateModuleJson("not a roast and not json", moduleConfig, "Medixineman", "Medixineman");
assert.strictEqual(garbage.ok, false, "garbage text must still fail closed");

const userPrompt = compileUserPrompt(
  "profile_roaster",
  "Medixineman",
  "en",
  "",
  "Medixineman",
  "Medi",
  { randomPersona: "Deadpan, monotone tech corporate evaluator issuing an absolute performance demotion.", varietyToken: "test-token" }
);
assert.match(userPrompt, /brutal_oneliner/);
assert.match(userPrompt, /Return ONLY a JSON object/i);
assert.doesNotMatch(userPrompt, /exact 4-part layout/i);
assert.match(userPrompt, /VARIETY_TOKEN: test-token/);

console.log("parse-roast-payload tests passed");
