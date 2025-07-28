import React, { useContext, useEffect, useState } from 'react'
import "./Chat.css"
import LeftSideBar from '../../components/LeftSideBar/LeftSideBar'
import ChatBox from '../../components/ChatBox/ChatBox'
import RightSideBar from '../../components/RightSideBar/RightSideBar'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Chat = () => {
  const { userData, isLoading, selectedUser } = useContext(AppContext)
  const navigate = useNavigate()
  const [showUsers, setShowUsers] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 600)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 600)
      if (window.innerWidth > 600) setShowUsers(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isSmallScreen && selectedUser) {
      setShowUsers(false)
    }
  }, [selectedUser, isSmallScreen])

  useEffect(() => {
    if (!isLoading && !userData) {
      navigate('/')
    }
  }, [userData, isLoading, navigate])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!userData) {
    return null
  }

  return (
    <div className='chat'>
      <div className="chat-container">
        {isSmallScreen && (
          <button
            className="users-toggle-btn"
            onClick={() => setShowUsers((prev) => !prev)}
          >
            Users
          </button>
        )}
        {isSmallScreen ? (
          showUsers ? <LeftSideBar /> : <ChatBox />
        ) : (
          <>
            <LeftSideBar />
            <ChatBox />
            <RightSideBar />
          </>
        )}
      </div>
    </div>
  )
}

export default Chat