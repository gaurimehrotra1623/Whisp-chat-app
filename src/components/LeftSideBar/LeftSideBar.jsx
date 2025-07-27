import React, { useEffect, useState, useContext } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'

const LeftSideBar = () => {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [error, setError] = useState("")
    const { setSelectedUser } = useContext(AppContext)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCol = collection(db, 'users')
                const userSnapshot = await getDocs(usersCol)
                const userList = userSnapshot.docs.map(doc => doc.data())
                setUsers(userList)
                if (userList.length === 0) setError("No users found.")
                else setError("")
                console.log('Fetched users:', userList)
            } catch (err) {
                setError("Failed to fetch users. See console for details.")
                console.error('Error fetching users:', err)
            }
        }
        fetchUsers()
    }, [])

    return (
        <div className='ls'>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo || '/logo.png'} className="logo" alt="" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className='sub-menu'>
                            <p onClick ={()=> navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                {/* <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input type="text" placeholder='Search here....' />
                </div> */}
            </div>
            <div className="ls-list">
                {error && <div style={{color:'red', padding:'10px'}}>{error}</div>}
                {users.map((user, index) => (
                    <div key={user.id || index} className="friends" onClick={() => setSelectedUser(user)}>
                        <img src={assets.logo || '/logo.png'} alt="" />
                        <div>
                            <p>{user.name || user.username || user.email}</p>
                            <span>{user.email}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LeftSideBar