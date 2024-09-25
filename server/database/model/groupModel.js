import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String },
  username: { type: String },
  settings: {
    lang: { type: String, default: "english" },
  },
  blocklist: { type: [String] },
  filters: {
    website: { type: String },
    buy: { type: String },
    adminList: { type: String },
  },
});

const Group = mongoose.model("Group", groupSchema);
export default Group;
