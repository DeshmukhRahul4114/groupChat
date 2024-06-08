// controllers/messageController.js
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');

exports.addMessage = async (req, res) => {
  const { groupId } = req.params;
  const { text, senderId } = req.body;
  
  try {
    const group = await Group.findById(groupId);
    const sender = await User.findById(senderId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    if (!sender) return res.status(404).json({ msg: 'Sender not found' });

    const message = new Message({
      message: { text },
      sender: senderId,
      group: groupId,
    });
    await message.save();

    group.messages.push(message._id);
    await group.save();

    const formattedMessage = {
      _id: message._id,
      text: message.message.text,
      likes: message.message.likes,
      sender: sender.username,
      group: message.group,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    res.status(201).json(formattedMessage);
  } catch (error) {
    res.status(400).json({ msg: 'Error creating message', error });
  }
};

exports.likeMessage = async (req, res) => {
  const { messageId, userId } = req.body;
  try {
    const message = await Message.findById(messageId);
    const user = await User.findById(userId);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (!message.likes.includes(userId)) {
      message.likes.push(userId);
      await message.save();

      // Fetch all messages in the group after updating likes
      const updatedMessages = await Message.find({ group: message.group });

      res.json(updatedMessages);
    } else {
      res.status(400).json({ msg: 'You already liked this message' });
    }
  } catch (error) {
    res.status(400).json({ msg: 'Error liking message', error });
  }
};


exports.getMessages = async (req, res) => {
  const { groupId } = req.params;
  try {
    // Get messages for the specified group
    const messages = await Message.find({ group: groupId });

    // Retrieve sender details for each message
    // const messagesWithSenderDetails = await Promise.all(messages.map(async (message) => {
    //   const sender = await User.findById(message.sender).select('username');
    //   const fromSelf = req.user.id === message.sender; // Assuming req.user contains the current user's details
    //   return {
    //     _id: message._id,
    //     text: message.message.text,
    //     likes: message.message.likes,
    //     sender: sender ? sender.username : null,
    //     group: message.group,
    //     createdAt: message.createdAt,
    //     updatedAt: message.updatedAt,
    //     fromSelf: fromSelf,
    //   };
    const messagesWithSenderDetails = await Promise.all(messages.map(async (message) => {
      const sender = await User.findById(message.sender).select('username');
      return {
        _id: message._id,
        text: message.message.text,
        likes: message.message.likes,
        sender: sender ? sender.username : null,
        group: message.group,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };
    }));

    // Return the messages with sender details
    res.json(messagesWithSenderDetails);
  } catch (error) {
    res.status(400).json({ msg: 'Error fetching messages', error });
  }
};

