import { bot } from "./app.mjs"; // Import the bot instance
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;

/**
 * Function to set the webhook.
 */
export async function setWebhook() {
  bot.telegram.deleteWebhook().then((res) => console.log(res));
  try {
    const webhookUrl = `https://techsavy.pw/webhook/${token}`;
    const allowedUpdates = [
      "message",
      "edited_channel_post",
      "callback_query",
      "message_reaction",
      "message_reaction_count",
      "chat_member",
    ];

    const info = await bot.telegram.setWebhook(webhookUrl, {
      allowed_updates: JSON.stringify(allowedUpdates),
    });

    console.log("Webhook set successfully:", info);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
}

// setWebhook();
// end();
