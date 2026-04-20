import React from 'react'
import Home from './Pages/Home'
import Auth from './Pages/Auth'
import Notes from './Pages/Notes'
import History from './Pages/History'
import Pricing from './Pages/Pricing'
import axios from "axios";
axios.defaults.withCredentials = true;

import{Navigate, Route,Routes}from'react-router-dom'
import { getCurrentuser } from './services/api'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PaymentSuccess from './Pages/PaymentSuccess'
import PaymentFailed from './Pages/PaymentFailed'
export const serverurl = "https://ai-notes-s.onrender.com"

function App(){
  const dispatch = useDispatch()
  
  useEffect(()=>{
    getCurrentuser(dispatch)
  },[dispatch])

  const {userData, loading} = useSelector((state)=>state.user)
  // console.log(userData);
  if(loading){
  return <div>Loading...</div>
}
  
  return(
 
   <Routes>
<Route path='/' element={userData ? <Home/> :<Navigate to ="/auth" replace/>}/> 
<Route path='/auth' element={userData ? <Navigate to="/"replace/>:<Auth/>} /> 
<Route path='/history' element={userData ? <History/>:<Navigate to="/"replace/>}/> 
<Route path='/notes' element={userData ? <Notes/> :<Navigate to="/"replace/>}/> 
<Route path='/pricing' element={userData ? <Pricing/> :<Navigate to="/"replace/>}/> 

<Route path="/payment-success" element={<PaymentSuccess/>} />
<Route path="/payment-failed" element={<PaymentFailed/>} />


   </Routes>
   
   
  )
}

export default App
