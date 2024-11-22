import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Group from "../database/model/groupModel.js";
import User from "../database/model/userModel.js";
import { botId } from "../../index.js";
const botLink = process.env.BOT_LINK;

const getAdmins = async (ctx) => {
  if (ctx.message.chat.id && ctx.chat.type !== "private") {
    try {
      const res = await ctx.getChatAdministrators(ctx.message.chat.id);

      if (res) {
        return res;
      } else {
        console.log("No admins found, returning empty array.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      return [];
    }
  } else {
    console.log(
      "Chat is private or chat ID is missing, returning empty array."
    );
    return [];
  }
};
const getGroup = async (ctx, id) => {
  console.log(id);
  try {
    const res = await ctx.getChat("@hjkljkjhkj");

    if (res) {
      return res;
    } else {
      console.log("No chat found");
      return [];
    }
  } catch (error) {
    console.error("Error fetching Chat:", error);
    return [];
  }
};

const registerGroup = async (ctx) => {
  // console.log(botId);
  // console.log(ctx.message);
  const newMember = ctx.message?.new_chat_member;

  if (newMember?.id == botId) {
    const chatId = ctx.message.chat.id;
    const chatTitle = ctx.message.chat.title;
    try {
      // Check if the group already exists in the MongoDB
      const groupExists = await Group.findOne({ id: chatId });

      if (!groupExists) {
        const newGroupData = new Group({
          id: chatId,
          title: chatTitle,
          username: ctx.message.chat.username || "",
          settings: {
            lang: "english", // Default language
          },
          blocklist: ["fake", "scam", "rug"], // Default blocklist
          filters: [],
        });

        // Save the new group to the MongoDB database
        await newGroupData.save();
        // console.log(`Group ${chatTitle} registered successfully.`);
        // ctx.reply(`Group ${chatTitle} has been successfully registered.`);
      } else {
        // console.log(`Group ${chatTitle} already exists.`);
        // ctx.reply(`Group ${chatTitle} is already registered.`);
      }
    } catch (error) {
      // console.error("Error registering group:", error);
      // ctx.reply("An error occurred while registering the group.");
    }
  }
};
// const updateGroupSettings = async (userId, pathToUpdate, newValue) => {
//   try {
//     // Load the admin user from the database
//     const adminUser = await User.findOne({ id: userId });

//     if (!adminUser || !adminUser.active_group) {
//       console.error("Admin user or active group not found.");
//       return;
//     }

//     const groupId = adminUser.active_group.id;

//     // Load the connected group from the database
//     const connectedGroup = await Group.findOne({ id: groupId });

//     if (!connectedGroup) {
//       console.error("Group not found.");
//       return;
//     }

//     // Function to update nested object properties
//     const updateObject = (obj, path, value) => {
//       const keys = path.split(".");
//       let current = obj;

//       for (let i = 0; i < keys.length - 1; i++) {
//         const key = keys[i];
//         if (!current[key]) current[key] = {}; // If key doesn't exist, create it
//         current = current[key];
//       }

//       current[keys[keys.length - 1]] = value; // Set the final key to the new value
//     };

//     // Update the group's settings using the path provided
//     updateObject(connectedGroup, pathToUpdate, newValue);

//     // Save the updated group back to the database
//     await connectedGroup.save();

//     console.log(
//       `Group ${connectedGroup.title} updated. Path: ${pathToUpdate}, New Value: ${newValue}`
//     );
//   } catch (error) {
//     console.error("Error updating group settings:", error);
//   }
// };

const updateGroupSettings = async (
  userId,
  pathToUpdate,
  newValue,
  operation
) => {
  try {
    // Load the admin user from the database
    const adminUser = await User.findOne({ id: userId });

    if (!adminUser || !adminUser.active_group) {
      console.error("Admin user or active group not found.");
      return;
    }

    const groupId = adminUser.active_group.id;

    // Load the connected group from the database
    const connectedGroup = await Group.findOne({ id: groupId });

    if (!connectedGroup) {
      console.error("Group not found.");
      return;
    }

    // Function to update nested object properties or arrays
    const updateObject = (obj, path, value, operation) => {
      const keys = path.split(".");
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {}; // If key doesn't exist, create it
        current = current[key];
      }
      const lastKey = keys[keys.length - 1];
      // Handle operations for arrays (blocklist)
      if (Array.isArray(current[lastKey])) {
        switch (operation) {
          case "addToList":
            if (!current[lastKey].includes(value)) {
              current[lastKey].push(value); // Add if not already in the list
            }
            break;
          case "removeFromList":
            current[lastKey] = current[lastKey].filter(
              (item) => item !== value
            ); // Remove the item
            break;
          default:
            console.error("Invalid operation for arrays.");
        }
      } else {
        // Perform standard operations based on the input
        switch (operation) {
          case "update":
            current[lastKey] = value; // Set the final key to the new value
            break;
          case "delete":
            delete current[lastKey]; // Delete the key
            break;
          case "put":
            current[lastKey] = value; // Replace the final key with the new value
            break;
          default:
            console.error("Invalid operation type.");
        }
      }
    };

    // Apply the specified operation
    updateObject(connectedGroup, pathToUpdate, newValue, operation);

    // Save the updated group back to the database
    await connectedGroup.save();

    console.log(
      `Group ${connectedGroup.title} updated. Operation: ${operation}, Path: ${pathToUpdate}, New Value: ${newValue}`
    );
  } catch (error) {
    console.error("Error updating group settings:", error);
  }
};

const handleCallback = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const [languageCode, userId] = callbackData.split(":");
  const userIdt = parseInt(userId);

  const languageMap = {
    lang_english: {
      lang: "english",
      message: "You selected language is English",
    },
    lang_turkish: {
      lang: "turkish",
      message: "You selected language is Turkish",
    },
    lang_french: { lang: "french", message: "You selected language is French" },
    lang_spanish: {
      lang: "spanish",
      message: "You selected language is Spanish",
    },
    lang_italian: {
      lang: "italian",
      message: "You selected language is Italian",
    },
    lang_russian: {
      lang: "russian",
      message: "You selected language is Russian",
    },
    lang_german: { lang: "german", message: "You selected language is German" },
  };

  const selectedLanguage = languageMap[languageCode];

  if (selectedLanguage) {
    updateGroupSettings(
      userIdt,
      "settings.lang",
      selectedLanguage.lang,
      "update"
    );
    await ctx.answerCbQuery("✅");
    await ctx.reply(selectedLanguage.message);
  }
};

const isAdmin = async (ctx) => {
  if (ctx.message?.chat?.id && ctx.chat.type !== "private") {
    try {
      const admins = await ctx.getChatAdministrators(ctx.message.chat.id);
      if (admins) {
        const adminExists = admins.some(
          (admin) => admin.user.username === ctx.message.from.username
        );
        return adminExists;
      }
      return false; // No admins were found
    } catch (error) {
      if (error.code === 403) {
        console.error("Bot was kicked from the chat:", ctx.message.chat.id);
      } else {
        console.error("Error fetching administrators:", error);
      }
      return false;
    }
  } else {
    console.log("Chat is private or chat ID is missing, returning false.");
    return false;
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const groupsBase = path.join(__dirname, "../group_db.json");
const adminsBase = path.join(__dirname, "../admins_db.json");

export {
  getAdmins,
  botLink,
  isAdmin,
  getGroup,
  registerGroup,
  handleCallback,
  updateGroupSettings,
};
