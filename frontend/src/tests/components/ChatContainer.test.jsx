import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import axiosMock from 'axios-mock-adapter';
import ChatContainer from '../../components/ChatContainer';
import { sendMessageRoute, recieveMessageRoute, deleteGroupRoute, addGroupMemberRoute, getMemberGroupRoute } from '../../utils/APIRoutes';

const mock = new axiosMock(axios);

const mockCurrentGroup = {
  _id: 'group1',
  name: 'Test Group',
  avatarImage: 'avatarImageString'
};

const mockSocket = {
  current: {
    emit: jest.fn(),
    on: jest.fn()
  }
};

const mockMembers = [
  { _id: 'user1', username: 'User One' },
  { _id: 'user2', username: 'User Two' }
];

describe('ChatContainer Component', () => {
  beforeEach(() => {
    localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify({
      username: 'testuser',
      _id: 'user1'
    }));
  });

  afterEach(() => {
    mock.reset();
    localStorage.clear();
  });

  test('should render chat messages', async () => {
    mock.onGet(`${recieveMessageRoute}/${mockCurrentGroup._id}/messages`).reply(200, [
      { _id: 'message1', text: 'Hello', sender: 'User One' },
      { _id: 'message2', text: 'Hi', sender: 'User Two' }
    ]);

    render(<ChatContainer currentGroup={mockCurrentGroup} socket={mockSocket} setAllGroup={jest.fn()} member={mockMembers} />);

    expect(await screen.findByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  test('should send a message', async () => {
    mock.onPost(`${sendMessageRoute}/${mockCurrentGroup._id}/admsg`).reply(200, {
      _id: 'message3',
      text: 'How are you?',
      sender: 'testuser',
      fromSelf: true
    });

    render(<ChatContainer currentGroup={mockCurrentGroup} socket={mockSocket} setAllGroup={jest.fn()} member={mockMembers} />);

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'How are you?' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText('How are you?')).toBeInTheDocument();
    });
  });

  test('should delete a group', async () => {
    mock.onDelete(`${deleteGroupRoute}/${mockCurrentGroup._id}`).reply(200);

    const setAllGroupMock = jest.fn((updateFunc) => {
      const newGroups = updateFunc([{ _id: 'group1', name: 'Test Group' }]);
      expect(newGroups).toHaveLength(0);
    });

    render(<ChatContainer currentGroup={mockCurrentGroup} socket={mockSocket} setAllGroup={setAllGroupMock} member={mockMembers} />);

    fireEvent.click(screen.getByText('Delete Group'));

    await waitFor(() => {
      expect(setAllGroupMock).toHaveBeenCalled();
    });
  });

  test('should add a member to the group', async () => {
    mock.onPut(`${addGroupMemberRoute}/${mockCurrentGroup._id}/members`).reply(200);

    render(<ChatContainer currentGroup={mockCurrentGroup} socket={mockSocket} setAllGroup={jest.fn()} member={mockMembers} />);

    fireEvent.click(screen.getByText('Add Member'));
    fireEvent.change(screen.getByLabelText('Enter Member Username'), { target: { value: 'User Two' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });

  test('should view group members', async () => {
    mock.onGet(`${getMemberGroupRoute}/${mockCurrentGroup._id}/viewmeber`).reply(200, mockMembers);

    render(<ChatContainer currentGroup={mockCurrentGroup} socket={mockSocket} setAllGroup={jest.fn()} member={mockMembers} />);

    fireEvent.click(screen.getByText('View Members'));

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });
});
