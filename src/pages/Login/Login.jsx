import React, {useState, useContext} from 'react'
import "./Login.css"
import assets from '../../assets/assets'
import { signup , login} from '../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { auth, db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {

  const [currState, setCurrState]= useState("Sign Up")
  const [userName, setUserName]= useState("")
  const [email, setEmail]= useState("")
  const [password, setPassword]= useState("")
  const navigate = useNavigate();
  const { loadUserData, setUserData } = useContext(AppContext);
  
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currState === "Sign Up") {
        const userData = await signup(userName, email, password);
        setUserData(userData);
        navigate('/profile');
      }
      else{
        await login(email,password)
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          setUserData(userData);
          
          if (!userData.name || userData.name.trim() === "") {
            navigate('/profile');
          } else {
            navigate('/chat');
          }
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };
  return (
    <div className='login'>
        <img src={assets.ooga} alt=" " className='logo'/>
        <form onSubmit = {onSubmitHandler} className='login-form'>
            <h2>{currState}</h2>
            {currState === "Sign Up" ? <input onChange ={(e)=>setUserName(e.target.value)} value={userName} type="text"placeholder='Username' className="form-input" required/> : null } 
            <input onChange ={(e)=>setEmail(e.target.value)} value={email}type="email" placeholder='Email address' className="form-input" required/>
            <input onChange ={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' className="form-input" required />
            <button type='submit'>{currState === "Sign Up" ? "Create Account" : "Login Now"}</button>
            <div className="login-term">
                <input type="checkbox"/>
                <p>I agree to the terms & conditions.</p>
            </div>
            <div className="login-forgot">
              {
              currState=== "Sign Up" 
              ? 
              <p className="login-toggle">Already have an account? <span onClick={()=> setCurrState("Login")}>Login Here!</span></p>
              : 
              <p className="login-toggle">Want to create an account? <span onClick={()=> setCurrState("Sign Up")}>Click Here!</span></p>
              }
                
                
            </div>
        </form>
    </div>
  )
}

export default Login