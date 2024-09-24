import { getAdmins } from "../funcs/functions.js";

const handleSpamMssg = async (ctx) => {


  if (ctx.message.chat.id && ctx.chat.type !== "private" && ctx.message.message_id && ctx.message.text && ctx.message.text.match(/(^|\s)@\w+/)) {
    

    const admins = await getAdmins(ctx)
    let adminTags = []
    const senderTag = ctx.message.from.username
    admins.forEach(admin => {
      adminTags.push(admin.user.username)
    });


    // handlling banned words 
    const bannerWords = ["scam", "fake", "de t"]
    if (!adminTags.includes(senderTag) && ctx.message.text.match(/(^|\s)@\w+/)) {
      const tagText = ctx.message.text.match(/(^|\s)@\w+/)[0].replace(/@/g, '').trim()
    
      
      if (!adminTags.includes(tagText)) {
        console.log("first")
      
        await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
      
      }
    }

    const offwords = bannerWords.filter((off) =>  ctx.message.text.toLowerCase().includes(off)).length

    if (!adminTags.includes(senderTag) && offwords > 0) {

        await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)

    }
  }
    
}
export {handleSpamMssg}