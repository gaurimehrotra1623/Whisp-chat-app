import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { logout } from '../../config/firebase'
import { useNavigate } from 'react-router-dom'

const ChatBox = () => {
  const { userData, selectedUser } = useContext(AppContext)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const navigate = useNavigate();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth <= 900);

  useEffect(() => {
    if (!userData || !selectedUser) return;
    const chatRef = doc(db, 'chats', userData.id)
    const unsub = onSnapshot(chatRef, (docSnap) => {
      const data = docSnap.data()
      if (!data || !data.chatData) return setMessages([])
      const filtered = data.chatData.filter(
        msg =>
          (msg.sId === userData.id && msg.rId === selectedUser.id) ||
          (msg.sId === selectedUser.id && msg.rId === userData.id)
      )
      setMessages(filtered)
      
      markMessagesAsRead()
    })
    return () => unsub()
  }, [userData, selectedUser])

  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const markMessagesAsRead = async () => {
    if (!userData || !selectedUser) return;
    
    try {
      const chatRef = doc(db, 'chats', userData.id);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) return;
      
      const chatData = chatSnap.data().chatData || [];
      let hasChanges = false;
      
      const updatedChatData = chatData.map(msg => {
        if (msg.sId === selectedUser.id && msg.rId === userData.id && msg.read !== true) {
          hasChanges = true;
          return { ...msg, read: true };
        }
        return msg;
      });
      
      if (hasChanges) {
        await updateDoc(chatRef, {
          chatData: updatedChatData
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !userData || !selectedUser) {
      console.log('Missing input, userData, or selectedUser', {input, userData, selectedUser});
      return;
    }
    const chatRef1 = doc(db, 'chats', userData.id);
    const chatRef2 = doc(db, 'chats', selectedUser.id);
    const msg = {
      sId: userData.id,
      rId: selectedUser.id,
      text: input,
      createdAt: Date.now(),
      read: false
    };
    try {
      const chatSnap1 = await getDoc(chatRef1);
      if (!chatSnap1.exists()) {
        await setDoc(chatRef1, { chatData: [] });
        console.log('Created chat doc for current user');
      }
      const chatSnap2 = await getDoc(chatRef2);
      if (!chatSnap2.exists()) {
        await setDoc(chatRef2, { chatData: [] });
        console.log('Created chat doc for selected user');
      }
      console.log('Sending message:', msg);
      await updateDoc(chatRef1, {
        chatData: arrayUnion(msg)
      });
      await updateDoc(chatRef2, {
        chatData: arrayUnion(msg)
      });
      setInput("");
      console.log('Message sent!');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. See console for details.');
    }
  }

  return (
    <div className='chat-box'>
      <div className="chat-user">
        <img src={assets.logo || '/logo.png'} alt="" />
        <p>{selectedUser ? (selectedUser.name || selectedUser.username || selectedUser.email) : "Select a user"} <img className='dot' src={assets.green_dot} alt=""/></p>
        {isMobileOrTablet ? (
          <button className="cb-logout-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <img src={assets.help_icon} className= "help" alt="" />
        )}
      </div>
      <div className="chat-msg">
        {messages.slice().reverse().map((msg, idx) => (
          <div key={idx} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            <div>
              <p className="msg">{msg.text}
                <span className="msg-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input type="text" placeholder='Send a message....' value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <input type="file" id='image' accept='image/png, image/jpeg' hidden/>
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img src={assets.send_button} alt="" onClick={handleSend} style={{cursor:'pointer'}} />
      </div>
    </div>
  )
}

export default ChatBox