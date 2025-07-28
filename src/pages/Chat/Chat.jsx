import React, { useContext, useEffect } from 'react'
import "./Chat.css"
import LeftSideBar from '../../components/LeftSideBar/LeftSideBar'
import ChatBox from '../../components/ChatBox/ChatBox'
import RightSideBar from '../../components/RightSideBar/RightSideBar'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Chat = () => {
  const { userData, isLoading } = useContext(AppContext)
  const navigate = useNavigate()

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
        <LeftSideBar/>
        <ChatBox/>
        <RightSideBar/>
      </div>

    </div>
  )
}

export default Chat