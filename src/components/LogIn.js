import React from "react";
import {auth} from "./firebaseConfig";
import {signInWithEmailAndPassword} from "firebase/auth";
import {useRef} from "react";
import {useNavigate} from "react-router-dom";

export let email1="";

const LogIn=()=>{

    const logINRef = useRef(null); // Reference to the form element

    const navigate=useNavigate(); // Navigate

    // Go Home
    const goHome=()=>{
        navigate('/Home',{replace:true});
    }

    // Log In
    const handleLogIn=(e)=>{
        e.preventDefault();

        const email = logINRef.current.email.value; // Access email input via ref
        email1=logINRef.current.email.value;
        const password = logINRef.current.password.value;

        signInWithEmailAndPassword(auth,email,password)
            .then(cred=>{
                console.log('User logged in',cred.user);
                goHome();
                window.alert("You are now logged in");
            })
            .catch(err=>{
                console.log(err.message);
                window.alert(err.message);
            });
    }

    return(
        <div id={'LogIn'}>
            <h1>Log In to your account:</h1>
            <form id={'LoginForm'} onSubmit={handleLogIn} ref={ logINRef}>
                <input type='email' name={'email'} placeholder={'Email:'} required />
                <input type='password' name={'password'} placeholder={'Password:'} required/>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
};

export default LogIn;