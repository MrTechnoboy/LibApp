// imports
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Link, Outlet} from "react-router-dom";
import {auth} from "./firebaseConfig";
import {signOut} from "firebase/auth";
import axios from "axios";

const Home = () => {

    const navigate=useNavigate();

    const [visitCount,setVisitCount]=useState(null);// Store visit count

    useEffect(() => {
        // Make a request to the php file script and fetch visit count
        axios.get('https://weblib.great-site.net/visit_counter.php')
            .then(response=>{
                setVisitCount(response.data.visitCount);// Set the visit count from PHP
            })
        .catch(error=>{
                console.log('Error fetching data: ',error);
            });
    }, []);


    // Log Out function
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
            <button type={'button'} onClick={LogOut} aria-label={'Log out of the application'}>Log out</button>
            {
                visitCount!=null ?(
                    <h1>This website has {visitCount} {visitCount===1 ? 'time':'times'}</h1>
                ):(
                    <h1>No visits</h1>
                )
            }
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