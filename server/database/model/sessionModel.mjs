import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  problem: { type: String },
  solution: { type: String },
  attemptsLeft: { type: Number },
  status: { type: String },
  newMemberId: { type: String },
  thisChatId: { type: String },
  challengeMessageId: { type: String },
  challengechatId: { type: String },
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
