const functions = require("firebase-functions");
const {Telegraf} = require("telegraf");
const LocalSession = require("telegraf-session-local");

// Your bot token
const bot = new Telegraf(functions.config().telegram.token);

// Use LocalSession to store captcha challenges
bot.use(new LocalSession({database: "captcha_db.json"}).middleware());

// Generates a simple math problem
function generateMathProblem() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const solution = num1 + num2;

  return {question: `${num1} + ${num2}`, solution};
}

// Challenge new users to solve a math problem
bot.on("new_chat_members", async (ctx) => {
  const newMembers = ctx.message.new_chat_members;

  for (const newMember of newMembers) {
    if (!newMember.is_bot) {
      const mathProblem = generateMathProblem();
      ctx.session.captcha = {
        problem: mathProblem.question,
        solution: mathProblem.solution,
        attemptsLeft: 3,
        status: "pending",
        newMemberId: newMember.id,
      };

      // Send the math challenge to the new user
      const challengeMessage = await ctx.replyWithHTML(`Welcome! Solve this math task: <b>${mathProblem.question}</b>`);

      ctx.session.captcha.challengeMessageId = challengeMessage.message_id;
      ctx.session.captcha.challengechatId = challengeMessage.chat.id;

      setTimeout(async () => {
        if (ctx.session.captcha.status === "pending") {
          await ctx.telegram.deleteMessage(
              ctx.session.captcha.challengechatId,
              ctx.session.captcha.challengeMessageId,
          );
          ctx.session.captcha.status = "expired";
          await ctx.telegram.banChatMember(
              ctx.session.captcha.challengechatId,
              ctx.session.captcha.newMemberId,
          );
        }
      }, 20000);
    }
  }
});

// Validate the user's response
bot.on("text", async (ctx) => {
  const userSession = ctx.session.captcha;

  if (userSession && userSession.status === "pending") {
    const userAnswer = parseInt(ctx.message.text, 10);
    await ctx.telegram.deleteMessage(
        ctx.message.chat.id, ctx.message.message_id);

    if (userAnswer === userSession.solution) {
      await ctx.telegram.deleteMessage(ctx.session.captcha.challengechatId, ctx.session.captcha.challengeMessageId);
      userSession.status = "solved";
      await ctx.reply("Correct! You passed the captcha.");
    } else {
      userSession.attemptsLeft--;
      if (userSession.attemptsLeft <= 0) {
        userSession.status = "failed";
        await ctx.reply("You failed the captcha.");
        await ctx.telegram.banChatMember(
            ctx.session.captcha.challengechatId,
            ctx.session.captcha.newMemberId,
        );
      } else {
        await ctx.reply(
            `Incorrect. Attempts left: ${userSession.attemptsLeft}`,
        );
      }
    }
  }
});

// Export as Firebase function
exports.telegramBot = functions.https.onRequest(async (req, res) => {
  await bot.handleUpdate(req.body);
  res.status(200).send("OK");
});
