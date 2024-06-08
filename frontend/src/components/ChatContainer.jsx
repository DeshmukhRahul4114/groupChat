import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Modal, Box } from "@mui/material";
import { sendMessageRoute, recieveMessageRoute, deleteGroupRoute, addGroupMemberRoute, getMemberGroupRoute } from "../utils/APIRoutes";

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

export default function ChatContainer({
  currentGroup,
  socket,
  setAllGroup,
  member,
}) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      setCurrentUserName(data.username);
      const response = await axios.get(`${recieveMessageRoute}/${currentGroup._id}/messages`);
      setMessages(response.data);
    };
    fetchData();
  }, [currentGroup]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${getMemberGroupRoute}/${currentGroup._id}/viewmeber`);
        setGroupMembers(response.data);
      } catch (error) {
        console.error('Error fetching group members:', error);
        toast.error("Failed to fetch group members");
      }
    };
    fetchMembers();
  }, [currentGroup]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    socket.current.emit("send-msg", {
      to: currentGroup._id,
      from: data._id,
      msg,
    });
    const response = await axios.post(`${sendMessageRoute}/${currentGroup._id}/admsg`, {
      text:msg,
      senderId:data._id
    });
    const newMessage = response.data;
    newMessage.fromSelf = true; // Set fromSelf to true for the current message

    const msgs = [...messages, newMessage];
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDelete = async (groupId) => {
    try {
      await axios.delete(`${deleteGroupRoute}/${groupId}`);
      setAllGroup((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  const handleAddMember = async (groupId) => {
    try {
      // Check if memberId exists in the member array
      const existingMember = member.find(m => m.username === memberId);
      if (existingMember) {
        const response = await axios.put(`${addGroupMemberRoute}/${groupId}/members`, { userId: existingMember._id });
        setOpen(false);
        // Handle the response as needed
      } else {
        toast.error("Member does not exist");
      }
    } catch (error) {
      console.error("Error adding member to the group:", error);
      toast.error("Failed to add member to the group");
    }
  };

  const handleLikeMessage = async (messageId,groupId) => {
    try {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(`${recieveMessageRoute}//messages/like`, { messageId,userId:data._id });
      const updatedMessage = response.data;
      setMessages(prevMessages => prevMessages.map(message => message._id === updatedMessage._id ? updatedMessage : message));
    } catch (error) {
      console.error('Error liking message:', error);
      toast.error('Failed to like message');
    }
  };
  
  
  return (
    <>
    {modalOpen && (
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
        <ul className="member-list">
        {groupMembers.map((member) => (
          <li key={member._id} className="member-list-item">
            {member.username}
          </li>
        ))}
      </ul>
        </Box>
      </Modal>
    )}
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentGroup.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentGroup.name}</h3>
          </div>
          <Button
            onClick={() => handleDelete(currentGroup._id)}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "red",
              "&:hover": {
                backgroundColor: "darkred",
              },
            }}
          >
            Delete Group
          </Button>
          <Button
            onClick={() => setOpen(true)}
            variant="contained"
            size="small"
            color="primary"
          >
            Add Member
          </Button>
          <Button
            className="view-member-button"
            onClick={() => setModalOpen(true)}
            variant="contained"
            size="small"
            color="primary"
          >
            View Members
          </Button>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Add Member</DialogTitle>
            <DialogContent>
              <TextField
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                label="Enter Member Username"
                variant="outlined"
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={()=>handleAddMember(currentGroup._id)} color="primary">
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.sender}</p>
                  <p>{message.text}</p>
                  {/* Like button */}
                  <button onClick={() => handleLikeMessage(message._id,currentGroup._id)}>❤️</button>
                  <p>{message.likes.length}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    border-radius: 18px;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: black;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
