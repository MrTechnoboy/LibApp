import React, {useEffect, useState} from 'react';
import {Link, Outlet} from "react-router-dom";

const Home = () => {

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

    return (
        <div id={'Home'}>
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