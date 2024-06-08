import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ChatInput from '../ChatInput';

describe('ChatInput component', () => {
  const handleSendMsg = jest.fn();

 test('renders input field and send button', () => {
    const { getByPlaceholderText, getByText } = render(<ChatInput handleSendMsg={handleSendMsg} />);
    expect(getByPlaceholderText('type your message here')).toBeInTheDocument();
    expect(getByText('Send')).toBeInTheDocument();
  });

 test('calls handleSendMsg when send button is clicked', () => {
    const { getByText, getByPlaceholderText } = render(<ChatInput handleSendMsg={handleSendMsg} />);
    const inputField = getByPlaceholderText('type your message here');
    const sendButton = getByText('Send');

    fireEvent.change(inputField, { target: { value: 'Hello, world!' } });
    fireEvent.click(sendButton);

    expect(handleSendMsg).toHaveBeenCalledWith('Hello, world!');
  });

 test('does not call handleSendMsg if input field is empty', () => {
    const { getByText } = render(<ChatInput handleSendMsg={handleSendMsg} />);
    const sendButton = getByText('Send');

    fireEvent.click(sendButton);

    expect(handleSendMsg).not.toHaveBeenCalled();
  });
});
