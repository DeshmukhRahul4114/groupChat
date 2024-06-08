const request = require('supertest');
const mongoose = require('mongoose');
const { mockRequest, mockResponse } = require('jest-mock-req-res');

const Group = require('../../models/groupModel');
const User = require('../../models/userModel');
const groupController = require('../../controllers/groupController');

// Mock mongoose models
jest.mock('../../models/groupModel');
jest.mock('../../models/userModel');

describe('Group Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('groupContoller test cases ', () => {
    describe('create group test cases ', () => {
    test('should create a new group', async () => {
      const req = mockRequest({ body: { name: 'Test Group' } });
      const res = mockResponse();

      Group.mockImplementation(() => {
        return {
          save: jest.fn().mockResolvedValue({ name: 'Test Group' }),
        };
      });

      await groupController.createGroup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle errors', async () => {
      const req = mockRequest({ body: { name: 'Test Group' } });
      const res = mockResponse();

      Group.mockImplementation(() => {
        return {
          save: jest.fn().mockRejectedValue(new Error('Error creating group')),
        };
      });

      await groupController.createGroup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error creating group' });
    });
  });

  describe('deleteGroup', () => {
    test('should delete a group', async () => {
      const req = mockRequest({ params: { groupId: '123' } });
      const res = mockResponse();

      Group.findByIdAndDelete.mockResolvedValue(true);

      await groupController.deleteGroup(req, res);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Group deleted' });
    });

    test('should handle errors', async () => {
      const req = mockRequest({ params: { groupId: '123' } });
      const res = mockResponse();

      Group.findByIdAndDelete.mockRejectedValue(new Error('Error deleting group'));

      await groupController.deleteGroup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error deleting group' });
    });
  });

  describe('searchGroups', () => {
    test('should search for groups', async () => {
      const req = mockRequest({ query: { name: 'Test' } });
      const res = mockResponse();

      Group.find.mockResolvedValue([{ name: 'Test Group' }]);

      await groupController.searchGroups(req, res);
      expect(res.json).toHaveBeenCalledWith([{ name: 'Test Group' }]);
    });

    test('should handle errors', async () => {
      const req = mockRequest({ query: { name: 'Test' } });
      const res = mockResponse();

      Group.find.mockRejectedValue(new Error('Error searching groups'));

      await groupController.searchGroups(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error searching groups' });
    });
  });

  describe('addMember', () => {
    test('should add a member to a group', async () => {
      const req = mockRequest({ params: { groupId: '123' }, body: { userId: '456' } });
      const res = mockResponse();

      Group.findById.mockResolvedValue({ members: [], save: jest.fn().mockResolvedValue(true) });
      User.findById.mockResolvedValue(true);

      await groupController.addMember(req, res);
      expect(res.json).toHaveBeenCalledWith({ members: ['456'], save: expect.any(Function) });
    });

    test('should return 404 if group or user not found', async () => {
      const req = mockRequest({ params: { groupId: '123' }, body: { userId: '456' } });
      const res = mockResponse();

      Group.findById.mockResolvedValue(null);
      User.findById.mockResolvedValue(null);

      await groupController.addMember(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Group or User not found' });
    });

    test('should handle errors', async () => {
      const req = mockRequest({ params: { groupId: '123' }, body: { userId: '456' } });
      const res = mockResponse();

      Group.findById.mockRejectedValue(new Error('Error adding member'));

      await groupController.addMember(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error adding member' });
    });
  });

  describe('getAllGroups', () => {
    test('should get all groups', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Group.find.mockResolvedValue([{ name: 'Test Group' }]);

      await groupController.getAllGroups(req, res);
      expect(res.json).toHaveBeenCalledWith([{ name: 'Test Group' }]);
    });

    test('should handle errors', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Group.find.mockRejectedValue(new Error('Error fetching groups'));

      await groupController.getAllGroups(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error fetching groups' });
    });
  });

  describe('viewMembers', () => {
    test('should view members of a group', async () => {
      const req = mockRequest({ params: { groupId: '123' } });
      const res = mockResponse();

      Group.findById.mockResolvedValue({ members: ['456'] });
      User.find.mockResolvedValue([{ _id: '456', username: 'testuser' }]);

      await groupController.viewMembers(req, res);
      expect(res.json).toHaveBeenCalledWith([{ _id: '456', username: 'testuser' }]);
    });

    test('should return 404 if group not found', async () => {
      const req = mockRequest({ params: { groupId: '123' } });
      const res = mockResponse();

      Group.findById.mockResolvedValue(null);

      await groupController.viewMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Group not found' });
    });
  });
});
});
