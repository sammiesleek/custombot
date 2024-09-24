import { Markup } from "telegraf";
import { botLink, isAdmin, loadDataBase, saveToDataBase } from "./functions.js";

const connectAdmin = async (ctx) => {
  const isUserAdmin = await isAdmin(ctx);
  if (isUserAdmin) {
    try {
      if (ctx.message.text && ctx.message.text[0].toLowerCase() == "/") {
        const textCommand = ctx.message.text.toLowerCase(); // Normalize command

        switch (textCommand) {
          case "/start": {
            const user = ctx.message.from;

            if (ctx.message.chat.id && ctx.chat.type == "private") {
              const adminUser = loadDataBase("admins").filter(
                (admin) => admin.id === user.id
              )[0];

              if (adminUser) {
                const groupId = adminUser.active_group.id;
                const connectedGroup = loadDataBase("groups").filter(
                  (group) => group.id === groupId
                )[0];

                ctx.reply(`You are  connected to ${connectedGroup.title}`);
              } else {
                ctx.reply("You are not connected to any group");
              }
            }

            break;
          }
          case "/setlang": {
            break;
          }
          case "/linkup": {
            const userIsAdmin = await isAdmin(ctx);
            if (userIsAdmin) {
              const adminUser = ctx.message.from;
              const admins = loadDataBase("admins");

              if (admins.some((user) => user.id === adminUser.id)) {
                const thisAdminData = admins.filter(
                  (admin) => admin.id === adminUser.id
                )[0];
                let updatedAdminData = {
                  id: thisAdminData.id,
                  username: adminUser.username,
                  firstname: adminUser.first_name,
                };

                if (thisAdminData.active_group.id != ctx.chat.id) {
                  let updatedAdminData = {
                    id: thisAdminData.id,
                    username: thisAdminData.username,
                    firstname: thisAdminData.first_name,
                  };

                  updatedAdminData.active_group = {
                    id: ctx.chat.id,
                    admin: adminUser.id,
                    title: ctx.chat.title,
                  };

                  let updatedGroupins = thisAdminData.group_ins.filter(
                    (group) => group.id != ctx.chat.id
                  );

                  updatedGroupins.push({
                    id: ctx.chat.id,
                    admin: adminUser.id,
                    title: ctx.chat.title,
                  });

                  updatedAdminData.group_ins = updatedGroupins;

                  let adminDatatoSave = admins.filter(
                    (admin) => admin.id != adminUser.id
                  );
                  adminDatatoSave.push(updatedAdminData);
                  saveToDataBase("admins", adminDatatoSave);
                }
              } else {
                const thisAdminData = {
                  id: adminUser.id,
                  username: adminUser.username,
                  firstname: adminUser.first_name || "",
                  active_group: {
                    id: ctx.chat.id,
                    admin: adminUser.id,
                    title: ctx.chat.title,
                  },
                  group_ins: [
                    {
                      id: ctx.chat.id,
                      title: ctx.chat.title,
                      admin: adminUser.id,
                    },
                  ],
                };

                let updatedAdmins = admins;

                updatedAdmins.push(thisAdminData);

                console.log(updatedAdmins);

                saveToDataBase("admins", updatedAdmins);
              }

              const userDisplayName = adminUser.username
                ? "@" + adminUser.username
                : adminUser.first_name || adminUser.last_name || "there";

              const resMessage = await ctx.reply(
                `Hello ${userDisplayName}, Please click the button to chat with me:`,
                {
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: "Chat with the Bot", url: botLink || "#" }], // Button with URL to the bot's DM
                    ],
                  },
                }
              );

              setTimeout(() => {
                ctx.telegram.deleteMessage(
                  resMessage.chat.id,
                  resMessage.message_id
                );
                ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
              }, 4000);
            } else {
              ctx.reply("You need to be an Admin to use this command");
            }

            break;
          }

          case "/link": {
            // Handle `/link` command logic here
            ctx.reply("This feature is not implemented yet.");
            break;
          }

          default: {
            ctx.reply("Unknown command. Please use /linkup or /link.");
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error processing admin command:", error);
      ctx.reply("An error occurred while processing your request.");
    }
  }
};

const handleSettingsCommand = async (ctx) => {
  const userId = ctx.message.from.id;
  const userIsAdmin = loadDataBase("admins").some(
    (admin) => admin.id === userId
  );

  if (userIsAdmin) {
    try {
      if (
        ctx.message.text &&
        ctx.message.text.toLowerCase().split(" ")[0][0] == "/"
      ) {
        const [command, value] = ctx.message.text.toLowerCase().split(" ");

        switch (command) {
          case "/setlang": {
            ctx.reply(
              "Please select your language:",

              Markup.inlineKeyboard([
                [
                  Markup.button.callback(
                    `English 🏴`,
                    `lang_english:${userId}`
                  ),
                  Markup.button.callback(
                    `Spanish 🇪🇸`,
                    `lang_spanish:${userId}`
                  ),
                  Markup.button.callback(
                    `Turkish 🇹🇲`,
                    `lang_turkish:${userId}`
                  ),
                ],
                [
                  Markup.button.callback(`French 🇫🇷`, `lang_french:${userId}`),
                  Markup.button.callback(
                    `Russian 🇷🇺`,
                    `lang_russian:${userId}`
                  ),
                  Markup.button.callback(
                    `Italian 🇮🇹`,
                    `lang_italian:${userId}`
                  ),
                ],
                [Markup.button.callback(`German 🇩🇪`, `lang_german:${userId}`)],
              ])
            );
          }
          case "/setla": {
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error processing admin command:", error);
      ctx.reply("An error occurred while processing your request.");
    }
  }
};

export { connectAdmin, handleSettingsCommand };
