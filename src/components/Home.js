import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Link, Outlet} from "react-router-dom";
import {auth} from "./firebaseConfig";
import {signOut} from "firebase/auth";

const Home = () => {

    const navigate=useNavigate();

    const [emailL,setEmail]=useState('');
    const [emailS,setEmailS]=useState('');

    useEffect(()=>{
        const emailL=localStorage.getItem('emailL');
        const emailS=localStorage.getItem('emailS');
        if(emailS){
            setEmailS(emailS);
        }
        if(emailL){
            setEmail(emailL);
        }
    },[]);



    const LogOut=()=>{
        signOut(auth)
            .then(()=>{
                console.log('User logged out');
                navigate('/',{replace:true});
                window.alert("You are now logged out");
            })
            .catch(err=>{
                console.log(err.message);
                window.alert(err.message);
            });
    }

    return (
        <div id={'Home'}>
            <button type={'button'} onClick={LogOut}>Log out</button>
            <div id={'Home-header'}>
                <Link to={'BrowseBooks'}>Search for Books</Link>
                <Link to={'MyBooks'}>My Books</Link>
                <Link to={'Posts'}>Posts</Link>
                <Link to={'MyPosts'}>My Posts</Link>
            </div>
            <Outlet/>
        </div>
    );
};

export default Home;