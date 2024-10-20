const Group = require("../database/model/groupModel");
const { getAdmins, isAdmin } = require("../funcs/functions");

const handleSpamMssg = async (ctx) => {
  const isAdminUser = await isAdmin(ctx);

  if (!isAdminUser) {
  }

  try {
    if (
      ctx.message.chat.id &&
      ctx.chat.type !== "private" &&
      ctx.message.message_id &&
      ctx.message.text &&
      ctx.message.text.match(/(^|\s)@\w+/)
    ) {
      if (isAdminUser && ctx.message.text.match(/(^|\s)@\w+/)) {
        const tagText = ctx.message.text
          .match(/(^|\s)@\w+/)[0]
          .replace(/@/g, "")
          .trim();

        if (!adminTags.includes(tagText)) {
          console.log("first");

          await ctx.telegram.deleteMessage(
            ctx.message.chat.id,
            ctx.message.message_id
          );
        }
      }
    }

    if (
      ctx.message.chat.id &&
      ctx.chat.type !== "private" &&
      ctx.message.message_id &&
      ctx.message.text
    ) {
      const thisGroup = await Group.findOne({ id: ctx.message.chat.id });
      const blocklist = thisGroup.blocklist;
      const offwords = blocklist.filter((off) =>
        ctx.message.text.toLowerCase().includes(off)
      ).length;
      if (offwords > 0) {
        await ctx.telegram.deleteMessage(
          ctx.message.chat.id,
          ctx.message.message_id
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = { handleSpamMssg };
