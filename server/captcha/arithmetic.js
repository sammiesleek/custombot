
// Function to generate a random math problem
function generateMathProblem() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const solution = num1 + num2;
  return { question: `${num1} + ${num2}`, solution };
}
 const arithMeticCaptcha = async (ctx) => {
    
   const newMember = ctx.chatMember.new_chat_member
   console.log(newMember.status)
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

          const userDisplayName = newMember.user.username ? '@'+newMember.user.username :newMember.user.first_name? newMember.user.first_name:newMember.user.last_name

         const challengeMessage = await ctx.replyWithHTML(
           `Hello ${userDisplayName} , Welcome to our community. Please prove to me that you are a human by solving this simple math task: <b>${mathProblem.question}</b>`
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
}

const handleArithmeticCaptcahResponse = async (ctx) => {
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


export {arithMeticCaptcha,handleArithmeticCaptcahResponse}