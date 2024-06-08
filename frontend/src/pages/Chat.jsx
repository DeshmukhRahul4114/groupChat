import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Typography, TextField, Button } from "@mui/material";
import { allUsersRoute, createGroupRoute, getGroupRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [group, setGroup] = useState([]);
  const [allGroup, setAllGroup] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const handleClose = () => setOpen(false);

  useEffect(async () => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )
      );
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(async () => {
    if (currentUser) {
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setContacts(data.data);
    }
  }, [currentUser]);

  useEffect(async () => {
    const data = await axios.get(`${getGroupRoute}`);
    setAllGroup(data.data);
  }, [group]);

  const handleCreateGroup = () => {
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = await axios.post(createGroupRoute, { name: groupName });
      setGroup(data.data.name);
      setOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleChatChange = (chat) => {
    setCurrentGroup(chat);
  };

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-title" variant="h6" component="h2">
              Create Group
            </Typography>
            <TextField
              id="modal-description"
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Create
            </Button>
          </Box>
        </Modal>
      )}
      <Container>
        <div className="container">
          <Contacts contacts={allGroup} changeChat={handleChatChange} createGroup={handleCreateGroup} />
          {currentGroup === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentGroup={currentGroup} socket={socket} setAllGroup={setAllGroup} member={contacts}/>
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
