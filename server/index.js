import express from "express";
import { Telegraf } from "telegraf";
import bodyParser from "body-parser";

import { handleSpamMssg } from "./antispam/antispam.js";
import {
  arithMeticCaptcha,
  handleArithmeticCaptcahResponse,
} from "./captcha/arithmetic.js";
import LocalSession from "telegraf-session-local";
import { connectAdmin, handleSettingsCommand } from "./funcs/commands.js";
import {
  handleCallback,
  loadDataBase,
  registerGroup,
  saveToDataBase,
} from "./funcs/functions.js";
const token = "7885430459:AAGpsZbmfL7ZlqzQM9JKTwAJmmgkd8YYXgo";
const app = express();
app.use(bodyParser.json());

const bot = new Telegraf(token); // Use environment variable for bot token
// Middleware for user sessions
bot.use(new LocalSession({ database: "botcha_db.json" }).middleware());

// Webhook handler for Telegram
app.post(`/webhook/${token}`, (req, res) => {
  bot
    .handleUpdate(req.body)
    .then(() => {
      console.log("working");
      res.sendStatus(200);
    }) // Respond with 200 OK if update was processed
    .catch((err) => {
      console.error("Failed to process update", err);
      res.sendStatus(500); // Respond with 500 Internal Server Error if something goes wrong
    });
});

//setting web hoook
// bot.telegram
//   .setWebhook(`https://fe7f-105-119-4-200.ngrok-free.app/webhook/${token}`, {
//     allowed_updates: JSON.stringify([
//       "message",
//       "edited_channel_post",
//       "callback_query",
//       "message_reaction",
//       "message_reaction_count",
//       "message",
//       "chat_member",
//     ]),
//   })
//   .then((info) => console.log(info));

// bot.telegram.deleteWebhook().then((res)=> console.log(res))

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, (res) => {
  console.log(`Server running on port ${PORT}`);
});

// Handle new chat members
bot.on("chat_member", async (ctx) => {
  arithMeticCaptcha(ctx);
});

// Handle new messages
bot.on("message", async (ctx) => {
  //ctx.session = null
  handleArithmeticCaptcahResponse(ctx);
  handleSpamMssg(ctx);

  connectAdmin(ctx);
  handleSettingsCommand(ctx);
  registerGroup(ctx);
});
// Handle callback_query
bot.on("callback_query", async (ctx) => {
  handleCallback(ctx);
});

// Utility endpoint to manually check webhook info
app.get("/webhook-info", async (req, res) => {
  const info = await bot.telegram.getWebhookInfo();
  res.json(info);
});
