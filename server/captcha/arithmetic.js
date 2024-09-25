import Group from "../database/model/groupModel.js";

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

// const captchaRes = (ctx, userDisplayName, mathProblem) => {
//   const thisGroupId = ctx.chatMember.chat.id;
//   const groupSettings = loadDataBase("groups").find(
//     (group) => group.id === thisGroupId
//   )?.settings;
//   const grouplang = groupSettings?.lang || "english";

//   const messages = {
//     english: `Hello ${userDisplayName}, Welcome to our community. Please prove to me that you are a human by solving this simple math task: <b>${mathProblem}</b>`,
//     turkish: `Merhaba ${userDisplayName}, Topluluğumuza hoş geldiniz. Lütfen bu basit matematik testini çözerek insan olduğunuzu kanıtlayın: <b>${mathProblem}</b>`,
//     spanish: `¡Hola, ${userDisplayName}! Bienvenido a nuestra comunidad. Por favor, demuéstrame que eres humano resolviendo este sencillo problema matemático: <b>${mathProblem}</b>`,
//     russian: `Привет, ${userDisplayName}! Добро пожаловать в наше сообщество. Пожалуйста, докажи, что ты человек, решив эту простую математическую задачу: <b>${mathProblem}</b>`,
//     italian: `Ciao ${userDisplayName}! Benvenuto nella nostra comunità. Per favore, dimostrami che sei umano risolvendo questo semplice problema matematico: <b>${mathProblem}</b>`,
//     french: `Salut ${userDisplayName} ! Bienvenue dans notre communauté. Merci de me prouver que tu es humain en résolvant ce simple problème de maths : <b>${mathProblem}</b>`,
//     german: `Hallo ${userDisplayName}! Willkommen in unserer Community. Bitte zeig mir, dass du ein Mensch bist, indem du diese einfache Matheaufgabe löst: <b>${mathProblem}</b>`,
//   };

//   return messages[grouplang] || messages.english;
// };

const arithMeticCaptcha = async (ctx) => {
  const newMember = ctx.chatMember.new_chat_member;
  console.log(newMember.status);
  if (!newMember.user.is_bot && newMember.status == "member") {
    const mathProblem = generateMathProblem();

    // Store the problem and solution in the session
    ctx.session.captcha = {
      problem: mathProblem.question,
      solution: mathProblem.solution,
      attemptsLeft: 30,
      status: "pending",
      newMemberId: newMember.user.id,
      thisChatId: ctx.chatMember.chat.id,
    };
    // Send the captcha challenge
    const userDisplayName = newMember.user.username
      ? "@" + newMember.user.username
      : newMember.user.first_name
      ? newMember.user.first_name
      : newMember.user.last_name;

    const challengeMessage = await ctx.replyWithHTML(
      await captchaRes(ctx, userDisplayName, mathProblem.question)
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
          ctx.session.captcha.newMemberId
        );
      }
    }, 10000);
  }
};

const handleArithmeticCaptcahResponse = async (ctx) => {
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
};

export { arithMeticCaptcha, handleArithmeticCaptcahResponse };
