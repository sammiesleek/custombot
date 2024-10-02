import express from "express";
import { Telegraf } from "telegraf";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import { handleSpamMssg } from "./antispam/antispam.js";
import {
  arithMeticCaptcha,
  handleArithmeticCaptcahResponse,
} from "./captcha/arithmetic.js";
import { handleCommands } from "./funcs/commands.js";
import { handleCallback, registerGroup } from "./funcs/functions.js";
import connectDB from "./database/db.js";
connectDB();

const token = process.env.BOT_TOKEN;
export const botId = token.split(":")[0];
const app = express();
app.use(bodyParser.json());

const bot = new Telegraf(token);

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
  handleArithmeticCaptcahResponse(ctx);
  handleSpamMssg(ctx);

  registerGroup(ctx);

  handleCommands(ctx);
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
