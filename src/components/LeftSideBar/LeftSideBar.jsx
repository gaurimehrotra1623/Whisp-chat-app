import React, { useEffect, useState, useContext } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'

const LeftSideBar = () => {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [error, setError] = useState("")
    const [unreadCounts, setUnreadCounts] = useState({})
    const { setSelectedUser, userData } = useContext(AppContext)

    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

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

    useEffect(() => {
        if (!userData) return;

        const chatRef = doc(db, 'chats', userData.id);
        const unsubscribe = onSnapshot(chatRef, (docSnap) => {
            const data = docSnap.data();
            if (!data || !data.chatData) {
                setUnreadCounts({});
                return;
            }

            const counts = {};
            data.chatData.forEach(msg => {
                if (msg.rId === userData.id && msg.read !== true) {
                    const senderId = msg.sId;
                    counts[senderId] = (counts[senderId] || 0) + 1;
                }
            });
            setUnreadCounts(counts);
        });

        return () => unsubscribe();
    }, [userData]);

    return (
        <div className='ls'>
            <div className="ls-top">
                <div className="ls-nav">
                    <div className="logo-section">
                        <img src={assets.logo || '/logo.png'} className="logo" alt="" />
                        {totalUnread > 0 && (
                            <div className="total-unread">
                                <span>{totalUnread}</span>
                            </div>
                        )}
                    </div>
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className='sub-menu'>
                            <p onClick ={()=> navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ls-list">
                {error && <div style={{color:'red', padding:'10px'}}>{error}</div>}
                {users.map((user, index) => (
                    <div key={user.id || index} className="friends" onClick={() => setSelectedUser(user)}>
                        <div className="friend-avatar">
                            <img src={assets.logo || '/logo.png'} alt="" />
                            {unreadCounts[user.id] > 0 && (
                                <div className="unread-indicator" style={{
                                    minWidth: unreadCounts[user.id] > 9 ? '22px' : '18px',
                                    borderRadius: unreadCounts[user.id] > 9 ? '11px' : '50%'
                                }}>
                                    <span className="unread-count">
                                        {unreadCounts[user.id] > 99 ? '99+' : unreadCounts[user.id]}
                                    </span>
                                </div>
                            )}
                        </div>
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