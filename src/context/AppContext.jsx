import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

export const AppContext = createContext()
const AppContextProvider = (props)=>{
    const navigate= useNavigate()
    const [userData, setUserData]= useState(null)
    const [chatData, setChatData]= useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [isLoading, setIsLoading]= useState(true)
    const [currentUserId, setCurrentUserId]= useState(null)
    
    const loadUserData = async (uid) => {
        // Prevent loading the same user multiple times
        if (currentUserId === uid && userData) {
            return
        }
        
        try {
            setCurrentUserId(uid)
            const userRef= doc(db,'users',uid)
            const userSnap= await getDoc(userRef)
            
            // If user document doesn't exist yet, wait a bit and try again
            if (!userSnap.exists()) {
                // Wait a bit for the document to be created (especially for new signups)
                setTimeout(async () => {
                    await loadUserData(uid)
                }, 1000)
                return
            }
            
            const userData = userSnap.data()
            setUserData(userData)
            
            await updateDoc(userRef,{
                lastSeen: Date.now()
            })
            setInterval(async ()=>{
                if(auth.currentUser){
                    await updateDoc(userRef,{
                        lastSeen: Date.now()
                    })
                }
            },60000)
        } catch (error) {
            console.error('Error loading user data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Add authentication listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, load their data but don't navigate automatically
                await loadUserData(user.uid)
            } else {
                // User is signed out
                setUserData(null)
                setChatData(null)
                setSelectedUser(null)
                setIsLoading(false)
                setCurrentUserId(null)
                navigate('/')
            }
        })

        return () => unsubscribe()
    }, [navigate])

    useEffect(()=>{
        if(userData){
            const chatRef = doc(db, 'chats', userData.id)
            const unSub = onSnapshot(chatRef, async (res) =>{
                const chatItems = res.data().chatData
                const tempData = []
                for(const item of chatItems){
                    const userRef = doc (db, 'users', item.rId)
                    const userSnap= await getDoc (userRef)
                    const userData=userSnap.data()
                    tempData.push({...item, userData})

                }
                setChatData(tempData.sort((a,b)=>b.updatedAt- a.updatedAt))
            })
            return () => {
                unSub()
            }
        }
    },[userData])

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        selectedUser, setSelectedUser,
        isLoading,
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider