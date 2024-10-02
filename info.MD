
SETTIGN WEBHOOK : https://api.telegram.org/bot7702991466:AAFQWqHP-bcpIowPiVDBMijsWfrLox7gUBw/setWebhook?url=https://botcha-37663de329fb.herokuapp.com/webhook/7702991466:AAFQWqHP-bcpIowPiVDBMijsWfrLox7gUBw&allowed_updates=["message","edited_channel_post","callback_query","chat_member","message_reaction","message_reaction_count"]
DELETING WEBHOOK : bot.telegram.deleteWebhook().then((res)=> console.log(res))

https://botcha-37663de329fb.herokuapp.com/webhook/7702991466:AAFQWqHP-bcpIowPiVDBMijsWfrLox7gUBw








// Set webhook (optional, based on your need)
// bot.telegram.setWebhook(`https://2812-105-113-16-89.ngrok-free.app/webhook/${token}`, {
//   allowed_updates: JSON.stringify([
//     "message",
//     "edited_channel_post",
//     "callback_query",
//     "message_reaction",
//     "message_reaction_count",
//     "message",
//     "chat_member",
//   ]),
// }).then((info) => console.log(info));

// Optionally delete webhook
// bot.telegram.deleteWebhook().then((res) => console.log(res));