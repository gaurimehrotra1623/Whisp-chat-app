import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'

const profileImages = [
  assets.profile_img,
  assets.profile_alison,
  assets.profile_marco,
  assets.profile_martin,
  assets.profile_enrique
];
const randomProfileImg = profileImages[Math.floor(Math.random() * profileImages.length)];

const ChatBox = () => {
  const { userData, selectedUser } = useContext(AppContext)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  useEffect(() => {
    if (!userData || !selectedUser) return;
    // Chat doc id is always the current user's id
    const chatRef = doc(db, 'chats', userData.id)
    const unsub = onSnapshot(chatRef, (docSnap) => {
      const data = docSnap.data()
      if (!data || !data.chatData) return setMessages([])
      // Show all messages exchanged between the two users
      const filtered = data.chatData.filter(
        msg =>
          (msg.sId === userData.id && msg.rId === selectedUser.id) ||
          (msg.sId === selectedUser.id && msg.rId === userData.id)
      )
      setMessages(filtered)
    })
    return () => unsub()
  }, [userData, selectedUser])

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
      createdAt: Date.now()
    };
    try {
      // Ensure chat docs exist
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
      // Log for debugging
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
        <img src={assets.logo} alt="" />
        <p>{selectedUser ? (selectedUser.name || selectedUser.username || selectedUser.email) : "Select a user"} <img className='dot' src={assets.green_dot} alt=""/></p>
        <img src={assets.help_icon} className= "help" alt="" />
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