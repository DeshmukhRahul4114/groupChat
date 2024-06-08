const request = require('supertest');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const mongoose = require('mongoose');
const Group = require('../../models/groupModel');
const User = require('../../models/userModel');
const Message = require('../../models/messageModel');
const messageController = require('../../controllers/messageController');

// Mock mongoose models
jest.mock('../../models/groupModel');
jest.mock('../../models/userModel');
jest.mock('../../models/messageModel');

describe('Message Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('message Controller test cases', () => {
  describe('addMessage', () => {
   test('should add a new message', async () => {
      const req = mockRequest({
        params: { groupId: 'testGroupId' },
        body: { text: 'Test Message', senderId: 'testSenderId' }
      });
      const res = mockResponse();

      Group.findById.mockResolvedValue({ _id: 'testGroupId', messages: [] });
      User.findById.mockResolvedValue({ _id: 'testSenderId', username: 'TestUser' });
      Message.prototype.save.mockResolvedValue({
        _id: 'testMessageId',
        message: { text: 'Test Message', likes: [] },
        sender: 'testSenderId',
        group: 'testGroupId',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await messageController.addMessage(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

   test('should handle errors when adding a message', async () => {
      const req = mockRequest({
        params: { groupId: 'testGroupId' },
        body: { text: 'Test Message', senderId: 'testSenderId' }
      });
      const res = mockResponse();

      Group.findById.mockRejectedValue(new Error('Error adding message'));

      await messageController.addMessage(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error creating message', error: expect.anything() });
    });
  });

  describe('likeMessage', () => {
   test.skip('should like a message', async () => {
      const req = mockRequest({
        body: { messageId: 'testMessageId', userId: 'testUserId' }
      });
      const res = mockResponse();

      Message.findById.mockResolvedValue({
        _id: 'testMessageId',
        message: { text: 'Test Message', likes: [] },
        save: jest.fn().mockResolvedValue({}),
      });
      User.findById.mockResolvedValue({ _id: 'testUserId' });

      await messageController.likeMessage(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'testMessageId',
        message: { likes: ['testUserId'] },
      }));
    });

   test('should handle errors when liking a message', async () => {
      const req = mockRequest({
        body: { messageId: 'testMessageId', userId: 'testUserId' }
      });
      const res = mockResponse();

      Message.findById.mockRejectedValue(new Error('Error liking message'));

      await messageController.likeMessage(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error liking message', error: expect.anything() });
    });
  });

  describe('getMessages', () => {
   test('should get messages for a group', async () => {
      const req = mockRequest({
        params: { groupId: 'testGroupId' }
      });
      const res = mockResponse();

      const messages = [
        {
          _id: 'testMessageId1',
          message: { text: 'Message 1', likes: [] },
          sender: 'testSenderId1',
          group: 'testGroupId',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'testMessageId2',
          message: { text: 'Message 2', likes: [] },
          sender: 'testSenderId2',
          group: 'testGroupId',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      Message.find.mockResolvedValue(messages);
      User.findById.mockImplementation((id) => {
        return {
          select: () => {
            return id === 'testSenderId1' ? { username: 'User1' } : { username: 'User2' };
          },
        };
      });

      await messageController.getMessages(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ text: 'Message 1', sender: 'User1' }),
        expect.objectContaining({ text: 'Message 2', sender: 'User2' }),
      ]));
    });

   test('should handle errors when getting messages', async () => {
      const req = mockRequest({
        params: { groupId: 'testGroupId' }
      });
      const res = mockResponse();

      Message.find.mockRejectedValue(new Error('Error fetching messages'));

      await messageController.getMessages(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error fetching messages', error: expect.anything() });
    });
  });
});
});
