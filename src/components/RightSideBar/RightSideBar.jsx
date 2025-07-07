import React, { useContext } from 'react'
import './RightSideBar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RightSideBar = () => {
  const { selectedUser } = useContext(AppContext)
  const navigate = useNavigate()
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }
  return (
    <div className='rs'>
        <div className="rs-profile">
            <img src={assets.logo} alt="Profile" />
            <h3>{selectedUser ? (selectedUser.username || selectedUser.name || selectedUser.email) : "Select a user"}<img src={assets.green_dot} className='dot'/></h3>
            <p>{selectedUser ? selectedUser.bio : ""}</p>
        </div>
        <hr />
        <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default RightSideBar