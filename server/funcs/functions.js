import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Group from "../database/model/groupModel.js";
import User from "../database/model/userModel.js";
import { botId } from "../index.js";
const botLink = "https://t.me/Tester_my_bot_bot?start=chat";

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
          filters: {
            website: "",
            buy: "",
            adminList: "",
          },
        });

        // Save the new group to the MongoDB database
        await newGroupData.save();
        console.log(`Group ${chatTitle} registered successfully.`);
        ctx.reply(`Group ${chatTitle} has been successfully registered.`);
      } else {
        console.log(`Group ${chatTitle} already exists.`);
        ctx.reply(`Group ${chatTitle} is already registered.`);
      }
    } catch (error) {
      console.error("Error registering group:", error);
      ctx.reply("An error occurred while registering the group.");
    }
  }
};
const updateGroupSettings = async (userId, pathToUpdate, newValue) => {
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

    // Function to update nested object properties
    const updateObject = (obj, path, value) => {
      const keys = path.split(".");
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {}; // If key doesn't exist, create it
        current = current[key];
      }

      current[keys[keys.length - 1]] = value; // Set the final key to the new value
    };

    // Update the group's settings using the path provided
    updateObject(connectedGroup, pathToUpdate, newValue);

    // Save the updated group back to the database
    await connectedGroup.save();

    console.log(
      `Group ${connectedGroup.title} updated. Path: ${pathToUpdate}, New Value: ${newValue}`
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
    updateGroupSettings(userIdt, "settings.lang", selectedLanguage.lang);
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

// const loadDataBase = (database) => {
//   if (database == "admins") {
//     if (fs.existsSync(adminsBase)) {
//       const data = fs.readFileSync(adminsBase, "utf8");
//       return JSON.parse(data);
//     }
//     return {};
//   } else if (database == "groups") {
//     if (fs.existsSync(groupsBase)) {
//       const data = fs.readFileSync(groupsBase, "utf8");
//       return JSON.parse(data);
//     }
//     return {};
//   }
// };

// const saveToDataBase = (database, data) => {
//   if (database == "admins") {
//     const tempFilePath = adminsBase + ".tmp";
//     fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), "utf8");
//     fs.renameSync(tempFilePath, adminsBase);
//   } else if (database == "groups") {
//     const tempFilePath = groupsBase + ".tmp";
//     fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), "utf8");
//     fs.renameSync(tempFilePath, groupsBase);
//   }
// };

// const updateGroupSettings = (userId, pathToUpdate, newValue) => {
//   // Load the admin user from the database
//   const adminUser = loadDataBase("admins").filter(
//     (admin) => admin.id === userId
//   )[0];

//   if (!adminUser || !adminUser.active_group) {
//     console.error("Admin user or active group not found.");
//     return;
//   }

//   const groupId = adminUser.active_group.id;

//   // Load the connected group from the database
//   const groups = loadDataBase("groups");
//   const connectedGroup = groups.filter((group) => group.id === groupId)[0];

//   if (!connectedGroup) {
//     console.error("Group not found.");
//     return;
//   }

//   // Function to update nested object properties
//   const updateObject = (obj, path, value) => {
//     const keys = path.split(".");
//     let current = obj;

//     for (let i = 0; i < keys.length - 1; i++) {
//       const key = keys[i];
//       if (!current[key]) current[key] = {}; // If key doesn't exist, create it
//       current = current[key];
//     }

//     current[keys[keys.length - 1]] = value; // Set the final key to the new value
//   };

//   // Update the group's settings using the path provided
//   updateObject(connectedGroup, pathToUpdate, newValue);

//   // Save the updated group back to the database
//   saveToDataBase("groups", groups);

//   // console.log(
//   //   `Group ${connectedGroup.title} updated. Path: ${pathToUpdate}, New Value: ${newValue}`
//   // );
// };
// const registerGroup = async (ctx) => {
//   const newMember = ctx.message?.new_chat_member;

//   if (newMember?.id === botId) {
//     const allGroups = loadDataBase("groups");

//     const groupExists = allGroups.some(
//       (group) => group.id === ctx.message.chat.id
//     );

//     if (!groupExists) {
//       const newGroupData = {
//         id: ctx.message.chat.id,
//         title: ctx.message.chat.title,
//         username: ctx.message.chat.username || "",
//         settings: {
//           lang: "english", // Default language
//         },
//         blocklist: ["fake", "scam", "rug"], // Default blocklist
//         filters: {
//           website: "",
//           buy: "",
//           adminList: "",
//         },
//       };

//       // Save the new group to the database
//       saveToDataBase("groups", [...allGroups, newGroupData]);

//       console.log(`Group ${ctx.message.chat.title} registered successfully.`);
//     } else {
//       console.log(`Group ${ctx.message.chat.title} already exists.`);
//     }
//   }
// };

export {
  getAdmins,
  botLink,
  isAdmin,
  getGroup,
  registerGroup,
  handleCallback,
  updateGroupSettings,
};
