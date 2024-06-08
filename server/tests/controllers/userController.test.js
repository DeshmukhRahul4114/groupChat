const request = require('supertest');
const { mockRequest, mockResponse } = require('jest-mock-req-res');
const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const userController = require('../../controllers/userController');

// Mock mongoose models
jest.mock('../../models/userModel');

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('user controller test cases', () => {
  describe('login', () => {
    test.skip('should login a user with correct credentials', async () => {
      const req = mockRequest({
        body: { username: 'testUser', password: 'testPassword' }
      });
      const res = mockResponse();
      
      const user = { username: 'testUser', password: await bcrypt.hash('testPassword', 10) };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      await userController.login(req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith({ status: true, user });
    });

    test('should return an error for incorrect username or password', async () => {
      const req = mockRequest({
        body: { username: 'testUser', password: 'wrongPassword' }
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await userController.login(req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith({ msg: 'Incorrect Username or Password', status: false });
    });
  });

  describe('register', () => {
    test('should register a new user', async () => {
      const req = mockRequest({
        body: { username: 'testUser', email: 'test@example.com', password: 'testPassword' }
      });
      const res = mockResponse();
      
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'testUserId',
        username: 'testUser',
        email: 'test@example.com',
        password: await bcrypt.hash('testPassword', 10)
      });

      await userController.register(req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: true,
        user: expect.objectContaining({
          _id: 'testUserId',
          username: 'testUser',
          email: 'test@example.com'
        })
      }));
    });

    test('should return an error if username is already used', async () => {
      const req = mockRequest({
        body: { username: 'testUser', email: 'test@example.com', password: 'testPassword' }
      });
      const res = mockResponse();

      User.findOne.mockResolvedValue({ username: 'testUser' });

      await userController.register(req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith({ msg: 'Username already used', status: false });
    });

    test('should return an error if email is already used', async () => {
      const req = mockRequest({
        body: { username: 'testUser', email: 'test@example.com', password: 'testPassword' }
      });
      const res = mockResponse();

      User.findOne.mockResolvedValueOnce(null);
      User.findOne.mockResolvedValueOnce({ email: 'test@example.com' });

      await userController.register(req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith({ msg: 'Email already used', status: false });
    });
  });

  describe.skip('getAllUsers', () => {
    test('should return all users except the given user id', async () => {
      const req = mockRequest({
        params: { id: 'testUserId' }
      });
      const res = mockResponse();
      
      const users = [
        { _id: 'user1', email: 'user1@example.com', username: 'user1', avatarImage: 'avatar1' },
        { _id: 'user2', email: 'user2@example.com', username: 'user2', avatarImage: 'avatar2' },
      ];
      User.find.mockResolvedValue(users);

      await userController.getAllUsers(req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith(users);
    });
  });

  describe('setAvatar', () => {
    test('should set the avatar for a user', async () => {
      const req = mockRequest({
        params: { id: 'testUserId' },
        body: { image: 'testImage' }
      });
      const res = mockResponse();
      
      User.findByIdAndUpdate.mockResolvedValue({
        _id: 'testUserId',
        isAvatarImageSet: true,
        avatarImage: 'testImage'
      });

      await userController.setAvatar(req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith({
        isSet: true,
        image: 'testImage'
      });
    });
  });

  describe('logOut', () => {
    test.skip('should log out a user', async () => {
      const req = mockRequest({
        params: { id: 'testUserId' }
      });
      const res = mockResponse();
      
      const onlineUsers = new Map();
      onlineUsers.set('testUserId', true);
      
      await userController.logOut(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return an error if user id is not provided', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await userController.logOut(req, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith({ msg: 'User id is required ' });
    });
  });
});
});
