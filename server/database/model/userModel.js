import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String },
  firstname: { type: String },
  active_group: {
    id: { type: String },
    admin: { type: String },
    title: { type: String },
  },
  group_ins: [
    {
      id: { type: String },
      admin: { type: String },
      title: { type: String },
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
