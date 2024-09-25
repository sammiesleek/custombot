import { Markup } from "telegraf";
import { botLink, isAdmin } from "./functions.js";
import User from "../database/model/userModel.js";
import Group from "../database/model/groupModel.js";

const handleCommands = async (ctx) => {
  try {
    if (ctx.message.text != undefined && ctx.message.text.startsWith("/")) {
      // hanlde commands from groups
      if (ctx.message.chat.type != "private") {
        groupCommands(ctx);
      }
      // handleCommands from bot dm
      if (ctx.message.chat.type == "private") {
        handleSettingsCommand(ctx);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const groupCommands = async (ctx) => {
  const isUserAdmin = await isAdmin(ctx); // Assume this checks if the user is an admin
  const textCommand = ctx.message.text.toLowerCase();

  try {
    switch (textCommand) {
      case "/connectme": {
        if (isUserAdmin) {
          const adminUser = ctx.message.from;
          let thisAdminData = await User.findOne({ id: adminUser.id });
          if (thisAdminData) {
            // Check if active group needs updating
            if (thisAdminData.active_group.id !== ctx.chat.id) {
              // Update the active group and group list
              thisAdminData.active_group = {
                id: ctx.chat.id,
                admin: adminUser.id,
                title: ctx.chat.title,
              };

              // Ensure the group is in the list of managed groups
              const groupExists = thisAdminData.group_ins.some(
                (group) => group.id === ctx.chat.id
              );

              if (!groupExists) {
                thisAdminData.group_ins.push({
                  id: ctx.chat.id,
                  admin: adminUser.id,
                  title: ctx.chat.title,
                });
              }

              // Save the updated admin data to the database
              await thisAdminData.save();
            }
          } else {
            // Create a new admin entry if they don't exist
            const newAdminData = new User({
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
            });

            // Save the new admin data to the database
            await newAdminData.save();
          }

          // Prepare the display name
          const userDisplayName = adminUser.username
            ? "@" + adminUser.username
            : adminUser.first_name || adminUser.last_name || "there";

          // Send a response message with a button
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

          // Delete the messages after 5 seconds
          setTimeout(async () => {
            try {
              await ctx.telegram.deleteMessage(
                resMessage.chat.id,
                resMessage.message_id
              );
              await ctx.telegram.deleteMessage(
                ctx.chat.id,
                ctx.message.message_id
              );
            } catch (error) {
              if (error.code === 400) {
                console.log("Message not found, cannot delete.");
              } else {
                console.error(error);
              }
            }
          }, 5000);
        }

        // Find the admin in the database
        break;
      }
    }
  } catch (error) {
    console.error("Error processing admin command:", error);
    ctx.reply("An error occurred while processing your request.");
  }
};

const handleSettingsCommand = async (ctx) => {
  const messageText = ctx.message.text;
  const [command, value] = messageText.toLowerCase().split(" ");
  const userId = ctx.message.from.id;
  try {
    // get user from users Table
    const adminUser = await User.findOne({ id: userId });
    if (adminUser) {
      const activeGroupId = adminUser.active_group?.id;

      if (activeGroupId) {
        const connectedGroup = await Group.findOne({ id: activeGroupId });

        if (connectedGroup) {
          switch (command) {
            case "/start": {
              ctx.reply(`You are connected to ${connectedGroup.title}`);

              break;
            }

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
                    Markup.button.callback(
                      `French 🇫🇷`,
                      `lang_french:${userId}`
                    ),
                    Markup.button.callback(
                      `Russian 🇷🇺`,
                      `lang_russian:${userId}`
                    ),
                    Markup.button.callback(
                      `Italian 🇮🇹`,
                      `lang_italian:${userId}`
                    ),
                  ],
                  [
                    Markup.button.callback(
                      `German 🇩🇪`,
                      `lang_german:${userId}`
                    ),
                  ],
                ])
              );
              break;
            }

            case "/setla": {
              // Handle "/setla" command logic here if needed
              break;
            }

            default: {
              ctx.reply("Unknown command. Please try again.");
              break;
            }
          }
        } else {
          ctx.reply("You are not connected to any active group.");
        }
      } else {
        ctx.reply("You are not connected to any active group.");
      }
    }
  } catch (error) {
    console.error("Error processing admin command:", error);
    ctx.reply("An error occurred while processing your request.");
  }
};

export { handleSettingsCommand, handleCommands };
