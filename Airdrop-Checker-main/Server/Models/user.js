import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSubscribed: { type: Boolean, default: false },
  claimedAirdrops: [{ type: String }], // 🔥 Track claimed airdrops
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
