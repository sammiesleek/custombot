const { Telegraf } = require("telegraf");
const LocalSession = require("telegraf-session-local");
const express = require("express");
const bodyParser = require("body-parser");
const token = "7885430459:AAGpsZbmfL7ZlqzQM9JKTwAJmmgkd8YYXgo"
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
 //bot.telegram.setWebhook(`https://c1e9-105-119-3-94.ngrok-free.app/webhook/${token}`,{allowed_updates: JSON.stringify(["message", "edited_channel_post", "callback_query", "message_reaction", "message_reaction_count","message", "chat_member"])}).then((info => console.log(info)));


// Start the server
const PORT = process.env.PORT || 6000;
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
  console.log(ctx.chatMember.chat.username)

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

      
      // Send the captcha challenge
      const challengeMessage = await ctx.replyWithHTML(
        `Hello @${newMember.user.username} , Welcome to our community. Please prove to me that you are a human by solving this simple math task: <b>${mathProblem.question}</b>`
      );
     

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


const getAdmins = async (ctx) => {
  try {
    const res = await ctx.getChatAdministrators(ctx.message.chat.id);

    if (res) {
      return res; 
    } else {
      return []; 
    }
  } catch (error) {
    console.error("Error fetching admins:", error);
    return []; 
  }
};

// handle users response to captcha 
const handleCaptcahResponse = async (ctx) => {
  const userSession = ctx.session.captcha
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
}

const preventspam = async (ctx) => {

  const admins =await getAdmins(ctx)
  let adminTags = []
  const senderTag = ctx.message.from.username
  admins.forEach(admin => {
    adminTags.push(admin.user.username)
  });
  if (!adminTags.includes(senderTag) && ctx.message.text.match(/(^|\s)@\w+/)) {
    const tagText = ctx.message.text.match(/(^|\s)@\w+/)[0].replace(/@/g,'').trim()
    
      
    if (!adminTags.includes(tagText)) {
      console.log("first")
      
        await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
      
    }
  }
}

// Handle new messages
bot.on("message", async (ctx) => {

handleCaptcahResponse(ctx)

  if (ctx.message.message_id && ctx.message.text) {
    
    preventspam(ctx)
  }


});


// Utility endpoint to manually check webhook info
app.get("/webhook-info", async (req, res) => {
  const info = await bot.telegram.getWebhookInfo();
  res.json(info);
});




[
  {
    user: {
      id: 7885430459,
      is_bot: true,
      first_name: 'Tester',
      username: 'Tester_my_bot_bot'
    },
    status: 'administrator',
    can_be_edited: false,
    can_manage_chat: true,
    can_change_info: true,
    can_delete_messages: true,
    can_invite_users: true,
    can_restrict_members: true,
    can_pin_messages: true,
    can_manage_topics: false,
    can_promote_members: false,
    can_manage_video_chats: true,
    can_post_stories: true,
    can_edit_stories: true,
    can_delete_stories: true,
    is_anonymous: false,
    can_manage_voice_chats: true
  },
  {
    user: {
      id: 5391044038,
      is_bot: false,
      first_name: 'Raphaël',
      username: 'Raphal_let'
    },
    status: 'administrator',
    can_be_edited: false,
    can_manage_chat: true,
    can_change_info: true,
    can_delete_messages: true,
    can_invite_users: true,
    can_restrict_members: true,
    can_pin_messages: true,
    can_manage_topics: false,
    can_promote_members: true,
    can_manage_video_chats: true,
    can_post_stories: true,
    can_edit_stories: true,
    can_delete_stories: true,
    is_anonymous: false,
    can_manage_voice_chats: true
  },
  {
    user: {
      id: 1131179178,
      is_bot: false,
      first_name: 'Sammy Ajayi || Artyfact',
      username: 'sammieajayi'
    },
    status: 'creator',
    is_anonymous: false
  }
]