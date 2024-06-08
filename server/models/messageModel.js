// models/messageModel.js
const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);