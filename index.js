const { Telegraf } = require("telegraf");
const LocalSession = require("telegraf-session-local");
const express = require("express");
const bodyParser = require("body-parser");
const token = process.env.BOT_TOKEN
const bot = new Telegraf(token); // Use environment variable for bot token

// Middleware for user sessions
bot.use(new LocalSession({ database: "captcha_db.json" }).middleware());

const app = express();
app.use(bodyParser.json());

// Webhook handler for Telegram
app.post(`/webhook/${token}`, (req, res) => {
  bot.handleUpdate(req.body)
  .then(() => {console.log("working"); res.sendStatus(200)}) // Respond with 200 OK if update was processed
    .catch((err) => {
      console.error("Failed to process update", err);
      res.sendStatus(500); // Respond with 500 Internal Server Error if something goes wrong
    });
});




// setting web hoook 
// bot.telegram.setWebhook(`https://aa7a-105-119-3-94.ngrok-free.app/webhook/${token}`,{allowed_updates: JSON.stringify(["message", "edited_channel_post", "callback_query", "message_reaction", "message_reaction_count","message", "chat_member"])}).then((info => console.log(info)));


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, (res) => {
  console.log(`Server running on port ${PORT}`);
});

// Function to generate a random math problem
function generateMathProblem() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const solution = num1 + num2;
  return { question: `${num1} + ${num2}`, solution };
}

// Handle new chat members with a captcha challenge
bot.on("chat_member", async (ctx) => {
  console.log(ctx.chatMember.chat.id)

   const newMember = ctx.chatMember.new_chat_member
    if (!newMember.user.is_bot && newMember.status == "member") {
      const mathProblem = generateMathProblem();

      // Store the problem and solution in the session
      ctx.session.captcha = {
        problem: mathProblem.question,
        solution: mathProblem.solution,
        attemptsLeft: 30,
        status: "pending",
        newMemberId: newMember.user.id,
        thisChatId:ctx.chatMember.chat.id
      };

      // Mute the new member
      //   await ctx.telegram.restrictChatMember(ctx.chat.id, newMember.id, {
      //     can_send_messages: false,
      //   });

      // Send the captcha challenge
      const challengeMessage = await ctx.replyWithHTML(
        `Welcome to our community. Please prove to me that you are a human by solving this simple math task: <b>${mathProblem.question}</b>`
      );
      //   const challengeMessage = await ctx.replyWithHTML(
      //     `Welcome <b>${newMember.first_name}</b>! 🚨\n\nBefore you can chat, solve this math problem: <b>${mathProblem.question}</b>\n\nYou have 3 attempts!`
      //   );

      ctx.session.captcha.challengeMessageId = challengeMessage.message_id;
      ctx.session.captcha.challengechatId = challengeMessage.chat.id;

      setTimeout(async () => {
        if (ctx.session.captcha.status === "pending") {
          await ctx.telegram.deleteMessage(
            ctx.session.captcha.challengechatId,
            ctx.session.captcha.challengeMessageId
          );
          ctx.session.captcha.status = "expired";
          await ctx.telegram.banChatMember(
            ctx.session.captcha.challengechatId,
            // ctx.session.captcha.thisChatId,
            ctx.session.captcha.newMemberId
          );
        }
      }, 10000);
    }
 
});

// Handle responses to the captcha challenge
bot.on("message", async (ctx) => {
  console.log(ctx)
const userSession = ctx.session.captcha;

  if (userSession && userSession.status === "pending") {
    const userAnswer = parseInt(ctx.message.text, 10);
    ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id);

    if (userAnswer === userSession.solution) {
      await ctx.telegram.deleteMessage(
        userSession.challengechatId,
        userSession.challengeMessageId
      );

      userSession.status = "solved";
    } else {
      userSession.attemptsLeft--;

      if (userSession.attemptsLeft > 0) {
      } else {
        userSession.status = "failed";
      }
    }
  }
});

// Uncomment if not using webhooks
// if (process.env.USE_WEBHOOK !== "true") {
// bot.launch();
// }

// Utility endpoint to manually check webhook info
app.get("/webhook-info", async (req, res) => {
  const info = await bot.telegram.getWebhookInfo();
  res.json(info);
});
