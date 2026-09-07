const assert = require("assert");
const {
  isTelegramStartCommand,
  buildTelegramStartWelcomePayload,
  resolveTelegramMiniAppUrl,
  telegramBotApiMethodUrl,
  handleTelegramWebhook
} = require("../server.js");

assert.strictEqual(isTelegramStartCommand("/start"), true);
assert.strictEqual(isTelegramStartCommand("/start ref_99"), true);
assert.strictEqual(isTelegramStartCommand("  /start"), true);
assert.strictEqual(isTelegramStartCommand("/help"), false);

const payload = buildTelegramStartWelcomePayload(4242);
assert.strictEqual(payload.chat_id, 4242);
assert.match(payload.text, /WELCOME TO THE CLOUT METER AI ARCADE/);
assert.strictEqual(payload.parse_mode, "Markdown");
assert.strictEqual(payload.reply_markup.inline_keyboard[0][0].text, "🕹️ LAUNCH AI SCANNERS");
assert.ok(payload.reply_markup.inline_keyboard[0][0].web_app.url.indexOf("https://") === 0);
assert.notStrictEqual(payload.reply_markup.inline_keyboard[0][0].web_app.url, "https://onrender.com");
assert.strictEqual(payload.reply_markup.inline_keyboard[1][0].callback_data, "menu_leaderboard");
assert.match(resolveTelegramMiniAppUrl(), /^https:\/\//);

const sendUrl = telegramBotApiMethodUrl("sendMessage");
assert.match(sendUrl, /^https:\/\/api\.telegram\.org\/bot/);
assert.match(sendUrl, /\/sendMessage$/);
assert.ok(sendUrl.indexOf("https://telegram.org") !== 0);

const calls = [];
const originalFetch = global.fetch;
global.fetch = async function (url, options) {
  calls.push({ url: String(url), options: options || {} });
  return {
    ok: true,
    json: async function () {
      return { ok: true, result: {} };
    }
  };
};

function mockRes() {
  return {
    headers: {},
    set: function () {},
    sendStatus: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (body) {
      this.body = body;
      this.statusCode = this.statusCode || 200;
      return this;
    }
  };
}

(async function runWebhookCases() {
  try {
    const startRes = mockRes();
    await handleTelegramWebhook({
      body: {
        message: {
          text: "/start",
          chat: { id: 777 }
        }
      },
      get: function () { return ""; }
    }, startRes);
    assert.strictEqual(startRes.body && startRes.body.success, true);
    const startCall = calls.find(function (call) {
      return call.url.indexOf("/sendMessage") !== -1;
    });
    assert.ok(startCall, " /start must POST sendMessage");
    const startBody = JSON.parse(startCall.options.body);
    assert.strictEqual(startBody.chat_id, 777);
    assert.ok(startBody.reply_markup.inline_keyboard[0][0].web_app.url);

    const paymentCallsBefore = calls.length;
    const payRes = mockRes();
    await handleTelegramWebhook({
      body: {
        message: {
          successful_payment: {
            invoice_payload: "skip"
          }
        }
      },
      get: function () { return ""; }
    }, payRes);
    assert.strictEqual(payRes.body && payRes.body.success, true);
    const paymentSend = calls.slice(paymentCallsBefore).some(function (call) {
      return call.url.indexOf("/sendMessage") !== -1;
    });
    assert.strictEqual(paymentSend, false, "Stars payment webhooks must not send the /start welcome");

    console.log("telegram-start-welcome tests passed");
    console.log(JSON.stringify({
      mini_app_url: resolveTelegramMiniAppUrl(),
      send_message_host: sendUrl.replace(/\/bot.*$/, "/bot<token>/sendMessage"),
      welcome_buttons: payload.reply_markup.inline_keyboard.map(function (row) {
        return row[0].text;
      })
    }, null, 2));
  } finally {
    global.fetch = originalFetch;
  }
})().catch(function (err) {
  global.fetch = originalFetch;
  console.error(err);
  process.exit(1);
});
