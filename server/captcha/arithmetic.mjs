import Group from "../database/model/groupModel.mjs";
import Session from "../database/model/sessionModel.js";

// Function to generate a random math problem
function generateMathProblem() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const solution = num1 + num2;
  return { question: `${num1} + ${num2}`, solution };
}

const captchaRes = async (ctx, userDisplayName, mathProblem) => {
  try {
    const thisGroupId = ctx.chatMember.chat.id;

    // Fetch the group settings from MongoDB
    const group = await Group.findOne({ id: thisGroupId });
    const grouplang = group?.settings?.lang || "english"; // Fallback to English if not set

    // Define the messages in different languages
    const messages = {
      english: `Hello ${userDisplayName}, Welcome to our community. Please prove to me that you are a human by solving this simple math task: <b>${mathProblem}</b>`,
      turkish: `Merhaba ${userDisplayName}, Topluluğumuza hoş geldiniz. Lütfen bu basit matematik testini çözerek insan olduğunuzu kanıtlayın: <b>${mathProblem}</b>`,
      spanish: `¡Hola, ${userDisplayName}! Bienvenido a nuestra comunidad. Por favor, demuéstrame que eres humano resolviendo este sencillo problema matemático: <b>${mathProblem}</b>`,
      russian: `Привет, ${userDisplayName}! Добро пожаловать в наше сообщество. Пожалуйста, докажи, что ты человек, решив эту простую математическую задачу: <b>${mathProblem}</b>`,
      italian: `Ciao ${userDisplayName}! Benvenuto nella nostra comunità. Per favore, dimostrami che sei umano risolvendo questo semplice problema matematico: <b>${mathProblem}</b>`,
      french: `Salut ${userDisplayName} ! Bienvenue dans notre communauté. Merci de me prouver que tu es humain en résolvant ce simple problème de maths : <b>${mathProblem}</b>`,
      german: `Hallo ${userDisplayName}! Willkommen in unserer Community. Bitte zeig mir, dass du ein Mensch bist, indem du diese einfache Matheaufgabe löst: <b>${mathProblem}</b>`,
    };

    // Return the message in the appropriate language, default to English
    return messages[grouplang] || messages.english;
  } catch (error) {
    console.error("Error fetching group settings:", error);
    // Fallback message in case of an error
    return `Hello ${userDisplayName}, Welcome to our community. Please solve this math task: <b>${mathProblem}</b>`;
  }
};

const arithMeticCaptcha = async (ctx) => {
  const newMember = ctx.chatMember.new_chat_member;
  if (!newMember.user.is_bot && newMember.status === "member") {
    const mathProblem = generateMathProblem();

    const userId = newMember.user.id;
    const chatId = ctx.chatMember.chat.id;

    // Send the captcha challenge
    const userDisplayName = newMember.user.username
      ? "@" + newMember.user.username
      : newMember.user.first_name
      ? newMember.user.first_name
      : newMember.user.last_name;

    try {
      const challengeMessage = await ctx.replyWithHTML(
        await captchaRes(ctx, userDisplayName, mathProblem.question)
      );

      // Create a new session for the user
      const newSession = new Session({
        id: userId,
        problem: mathProblem.question,
        solution: mathProblem.solution,
        attemptsLeft: 30,
        status: "pending",
        newMemberId: userId,
        thisChatId: chatId,
        challengeMessageId: challengeMessage.message_id,
        challengechatId: challengeMessage.chat.id,
      });

      await newSession.save();
    } catch (error) {
      console.error(`Error creating session for user ${userId}:`, error);

      return; // Exit the function on error
    }

    // Set a timeout for the captcha to expire
    setTimeout(async () => {
      const sessionData = await Session.findOne({ id: userId });
      if (sessionData) {
        try {
          // Attempt to delete the message
          await ctx.telegram.deleteMessage(
            sessionData.challengechatId,
            sessionData.challengeMessageId
          );

          // If the session is still pending, restrict the user
          if (sessionData.status === "pending") {
            await ctx.telegram.restrictChatMember(
              sessionData.challengechatId,
              sessionData.newMemberId
            );
          }
        } catch (error) {
          console.error(`Error handling timeout for user ${userId}:`, error);
        } finally {
          // Delete the session after processing the timeout
          await Session.deleteOne({ id: userId });
        }
      }
    }, 20000);
  }
};

const handleArithmeticCaptcahResponse = async (ctx) => {
  const userId = ctx.message.from.id; // Get the user ID
  const userSession = await Session.findOne({ id: userId }); // Fetch the user session from the database

  if (userSession && userSession.status === "pending") {
    const userAnswer = parseInt(ctx.message.text, 10);
    console.log(userAnswer);
    await ctx.telegram.deleteMessage(
      ctx.message.chat.id,
      ctx.message.message_id
    );

    if (userAnswer == userSession.solution) {
      await ctx.telegram.deleteMessage(
        userSession.challengechatId,
        userSession.challengeMessageId
      );

      await Session.deleteOne({ id: userId });
    }
  }
};

export { arithMeticCaptcha, handleArithmeticCaptcahResponse };
