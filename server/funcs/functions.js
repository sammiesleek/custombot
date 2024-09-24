import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
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
  if (ctx.message.new_chat_member && ctx.message.new_chat_member.id === botId) {
    let allgroups = loadDataBase("groups").filter(
      (group) => group.id != ctx.message.chat.id
    );

    allgroups.push({
      id: ctx.message.chat.id,
      title: ctx.message.chat.title,
      username: ctx.message.chat.username,
      settings: {
        lang: "english",
      },
      blocklist: ["fake", "scam", "rug"],
      filters: {
        website: "",
        buy: "",
        adminList: "",
      },
    });

    saveToDataBase("groups", allgroups);
  }
};

const isAdmin = async (ctx) => {
  if (ctx.message.chat.id && ctx.chat.type !== "private") {
    try {
      const admins = await ctx.getChatAdministrators(ctx.message.chat.id);
      if (admins) {
        const adminExists = admins.some(
          (admin) => admin.user.username === ctx.message.from.username
        );
        return adminExists;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error fetching administrators:", error);
      return false;
    }
  } else {
    console.log("Chat is private or chat ID is missing, returning false.");
    return false; // Directly return false without needing a Promise.resolve
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const groupsBase = path.join(__dirname, "../group_db.json");
const adminsBase = path.join(__dirname, "../admins_db.json");

const loadDataBase = (database) => {
  if (database == "admins") {
    if (fs.existsSync(adminsBase)) {
      const data = fs.readFileSync(adminsBase, "utf8");
      return JSON.parse(data);
    }
    return {};
  } else if (database == "groups") {
    if (fs.existsSync(groupsBase)) {
      const data = fs.readFileSync(groupsBase, "utf8");
      return JSON.parse(data);
    }
    return {};
  }
};

const saveToDataBase = (database, data) => {
  if (database == "admins") {
    const tempFilePath = adminsBase + ".tmp";
    fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempFilePath, adminsBase);
  } else if (database == "groups") {
    const tempFilePath = groupsBase + ".tmp";
    fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempFilePath, groupsBase);
  }
};

const updateGroupSettings = (userId, pathToUpdate, newValue) => {
  // Load the admin user from the database
  const adminUser = loadDataBase("admins").filter(
    (admin) => admin.id === userId
  )[0];

  if (!adminUser || !adminUser.active_group) {
    console.error("Admin user or active group not found.");
    return;
  }

  const groupId = adminUser.active_group.id;

  // Load the connected group from the database
  const groups = loadDataBase("groups");
  const connectedGroup = groups.filter((group) => group.id === groupId)[0];

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
  saveToDataBase("groups", groups);

  console.log(
    `Group ${connectedGroup.title} updated. Path: ${pathToUpdate}, New Value: ${newValue}`
  );
};

const handleCallback = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const [languageCode, userId] = callbackData.split(":");
  const userIdt = parseInt(userId);

  switch (languageCode) {
    case "lang_english":
      updateGroupSettings(userIdt, "settings.lang", "english");
      await ctx.answerCbQuery("✅");
      await ctx.reply(`You selected language is English`);
      break;
    case "lang_turkish":
      updateGroupSettings(userIdt, "settings.lang", "turkish");
      await ctx.answerCbQuery("✅");
      await ctx.reply(`You selected language is Turkish`);
      break;
    case "lang_french":
      updateGroupSettings(userIdt, "settings.lang", "french");
      await ctx.answerCbQuery("✅");
      await ctx.reply(`You selected language is French`);
      break;
    case "lang_spanish":
      updateGroupSettings(userIdt, "settings.lang", "spanish");
      await ctx.answerCbQuery("✅");
      await ctx.reply(`You selected language is Spanish`);
      break;
    case "lang_italian":
      updateGroupSettings(userIdt, "settings.lang", "italian");
      await ctx.answerCbQuery("✅");
      await ctx.reply(`You selected language is Italian`);
      break;
    case "lang_russian":
      updateGroupSettings(userIdt, "settings.lang", "russian");
      await ctx.answerCbQuery("✅");
      await ctx.reply(`You selected language is Russian`);
      break;
    default:
  }
};

export {
  getAdmins,
  botLink,
  isAdmin,
  groupsBase,
  adminsBase,
  loadDataBase,
  saveToDataBase,
  getGroup,
  registerGroup,
  handleCallback,
  updateGroupSettings,
};
