// controllers/groupController.js
const Group = require('../models/groupModel');
const User = require('../models/userModel');

exports.createGroup = async (req, res) => {
  const { name } = req.body;
  try {
    const newGroup = new Group({ name });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(400).json({ msg: 'Error creating group' });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    await Group.findByIdAndDelete(groupId);
    res.json({ msg: 'Group deleted' });
  } catch (error) {
    res.status(400).json({ msg: 'Error deleting group' });
  }
};

exports.searchGroups = async (req, res) => {
  const { name } = req.query;
  try {
    const groups = await Group.find({ name: new RegExp(name, 'i') });
    res.json(groups);
  } catch (error) {
    res.status(400).json({ msg: 'Error searching groups' });
  }
};

exports.addMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  try {
    const group = await Group.findById(groupId);
    const user = await User.findById(userId);
    if (group && user) {
      group.members.push(userId);
      await group.save();
      res.json(group);
    } else {
      res.status(404).json({ msg: 'Group or User not found' });
    }
  } catch (error) {
    res.status(400).json({ msg: 'Error adding member' });
  }
};

exports.getAllGroups = async (req, res) => {
    try {
      const groups = await Group.find();
      res.json(groups);
    } catch (error) {
      res.status(400).json({ msg: 'Error fetching groups' });
    }
};

exports.viewMembers = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Fetch members separately
    const members = await User.find({ _id: { $in: group.members } }, '_id username');

    // Format the result to include only _id and username fields
    const formattedMembers = members.map(member => ({
      _id: member._id,
      username: member.username
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

