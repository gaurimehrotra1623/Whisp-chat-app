
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { toast } from "react-toastify";



const firebaseConfig = {
apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "capstone-gs.firebaseapp.com",
  projectId: "capstone-gs",
  storageBucket: "capstone-gs.firebasestorage.app",
  messagingSenderId: "220042066987",
  appId: "1:220042066987:web:99e9351451429ba7e17e6e"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db= getFirestore(app);
const signup= async(username,email,password)=>{
    try {
        const res = await createUserWithEmailAndPassword(auth,email,password)
        const user = res.user;
        const userData = {
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey there! I am using Whisp!",
            lastSeen:Date.now()
        }
        await setDoc(doc(db,"users", user.uid), userData)
        await setDoc(doc(db, "chats",user.uid),{
            chatData:[]
        })
        toast.success("Account created successfully!");
        return userData;
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
        throw error;
    }
}
const login = async (email,password) => {
    try {
        await signInWithEmailAndPassword(auth,email,password)
    } 
    
    catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
        throw error;
    }
}
const logout =async ()=>{
    try {
        await signOut(auth)
        
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
    
}
export {signup,login, logout,auth,db}
