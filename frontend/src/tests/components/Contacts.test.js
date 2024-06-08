import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Contacts from '../Contacts';

describe('Contacts component', () => {
  const contacts = [
    { _id: '1', name: 'John' },
    { _id: '2', name: 'Doe' },
    { _id: '3', name: 'Jane' }
  ];

  const changeChat = jest.fn();
  const createGroup = jest.fn();

  test('renders contacts', () => {
    const { getByText } = render(<Contacts contacts={contacts} changeChat={changeChat} createGroup={createGroup} />);
    expect(getByText('John')).toBeInTheDocument();
    expect(getByText('Doe')).toBeInTheDocument();
    expect(getByText('Jane')).toBeInTheDocument();
  });

  test('changes chat on contact click', () => {
    const { getByText } = render(<Contacts contacts={contacts} changeChat={changeChat} createGroup={createGroup} />);
    fireEvent.click(getByText('John'));
    expect(changeChat).toHaveBeenCalledWith(0, contacts[0]);
  });

  test('calls createGroup when create group icon is clicked', () => {
    const { getByTestId } = render(<Contacts contacts={contacts} changeChat={changeChat} createGroup={createGroup} />);
    fireEvent.click(getByTestId('create-group-icon'));
    expect(createGroup).toHaveBeenCalled();
  });
});
