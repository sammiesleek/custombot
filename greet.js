const { Telegraf } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");

// Initialize bot with your bot token (use environment variables for security)
const bot = new Telegraf("7558552707:AAGUz0iZSXO6Rcwf4blSWq-dZBL5pV9AqUg");

const app = express();
app.use(bodyParser.json());

// Webhook handler for Telegram
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body)
    .then(() => res.sendStatus(200))  // Respond 200 OK if the bot processed the update
    .catch((err) => {
      console.error("Error processing update", err);
      res.sendStatus(500); // Respond 500 if there was an error
    });
});

// Set up a simple listener for new chat members
bot.on('chat_member', async (ctx) => {
    const newMmber = ctx.chatMember.new_chat_member
    console.log(newMmber.status)
    console.log(newMmber.user)
    console.log(newMmber.user.is_bot)
   
//   const newMembers = ctx.message.new_chat_members;
//   for (const member of newMembers) {
//     if (!member.is_bot) {
//       // Send a greeting message
//       await ctx.reply(`Welcome, ${member.first_name}! 🎉`);
//     }
//   }
});
// bot.on("message", async (ctx) => {
// //   const newMembers = ctx.message.new_chat_members;
// //   for (const member of newMembers) {
//     // if (!member.is_bot) {
//       // Send a greeting message
//       await ctx.reply(`Welcome 🎉`);
//     // }
// //   }
// });

// Uncomment to set webhook URL (set your webhook URL here)
bot.telegram.setWebhook(`https://aa7a-105-119-3-94.ngrok-free.app/webhook`,{allowed_updates: JSON.stringify(["message", "edited_channel_post", "callback_query", "message_reaction", "message_reaction_count","message", "chat_member"])}).then((info => console.log(info)))

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


