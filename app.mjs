import express from "express";
import { Telegraf } from "telegraf";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import { handleSpamMssg } from "./server/antispam/antispam.mjs";
import {
  arithMeticCaptcha,
  handleArithmeticCaptcahResponse,
} from "./server/captcha/arithmetic.mjs";
import { handleCommands } from "./server/funcs/commands.mjs";
import { handleCallback, registerGroup } from "./server/funcs/functions.mjs";
import connectDB from "./server/database/db.mjs";
import { setWebhook } from "./sethook.mjs";
connectDB();
const PORT = process.env.PORT || 9000;
const token = process.env.BOT_TOKEN;
const botLink = process.env.BOT_LINK;
export const botId = token.split(":")[0];
const app = express();

// Increase the timeout for the server
app.timeout = 60000;
express.json({ limit: "50mb" });

// Middleware with increased limits
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

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

app.get("/", async (req, res) => {
  res.json("connected");
});

// Keep alive ping every 3 minutes
setInterval(() => {
  try {
    bot.telegram.getMe().catch(console.error);
  } catch (error) {
    console.error("Keep alive error:", error);
  }
}, 180000);

// Start the server
const startServer = () => {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await setWebhook();
  });
};

// Error recovery
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// Start the server
startServer();
export { bot, botLink };
