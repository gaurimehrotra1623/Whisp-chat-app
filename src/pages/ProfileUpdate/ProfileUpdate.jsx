import React, { useContext, useEffect, useState } from 'react'
import "./ProfileUpdate.css"
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
  const navigate = useNavigate()
  const [image, setImage]= useState(false);
  const [name, setName]= useState("")
  const [bio, setBio]= useState("")
  const [uid, setUid]= useState("")
  const [prevImage, setPrevImage]= useState("")
  const {setUserData} = useContext(AppContext)

  const profileImages = [
    assets.profile_img,
    assets.profile_alison,
    assets.profile_marco,
    assets.profile_martin,
    assets.profile_enrique
  ];

  function getRandomProfileImg() {
    return profileImages[Math.floor(Math.random() * profileImages.length)];
  }

  const profileUpdate = async (event) => {
    event.preventDefault()
    try {
      const docRef = doc(db, 'users', uid)
      if (image){
        const imgUrl= await upload(image)
        setPrevImage(imgUrl)
        await updateDoc(docRef, {
          avatar: imgUrl,
          bio: bio,
          name: name
        })
      }
      else{
        await updateDoc(docRef, {
          bio: bio,
          name: name
        })
      }
      const snap = await getDoc(docRef)
      setUserData(snap.data());
      navigate('/chat');

    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    onAuthStateChanged(auth,async (user) => {
      if(user) {
        setUid(user.uid)
        const docRef = doc(db, "users", user.uid)
        const docSnap= await getDoc(docRef)
        if (docSnap.data().name){
          setName(docSnap.data().name)
        }
        if (docSnap.data().bio){
          setBio(docSnap.data().bio)
        }
        if (docSnap.data().avatar){
          setPrevImage((await docSnap).data().avatar)
        }
      }
      else{
        navigate('/')
      }
    })
  },[])

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px'}}>
            <img className="profile-pic" src={assets.logo || '/logo.png'} alt="Profile" />
          </div>
          <textarea onChange={(e)=> setBio(e.target.value)} value ={bio} placeholder='Write your bio....' required></textarea>
          <button type="submit">Save</button>
        </form>
        <img className="logo-img"src={assets.logo || '/logo.png'} alt="Profile" />
      </div>
    </div>
  )
}

export default ProfileUpdate