import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const SignUp = () => {
    const signupFormRef = useRef(null); // Reference to the form element
    const navigate = useNavigate(); // Navigate

    // Go Home
    const goHome = () => {
        navigate('/Home', { replace: true });
    };

    // Adding username
    const handleUsername = async () => {
        const username = signupFormRef.current?.username.value; // Check if ref exists

        if (!username) {
            console.error("Username field is empty or form ref is invalid");
            return;
        }

        try {
            // Use 'doc' to create or reference a document with a specific ID
            const docRef = doc(db, 'LibraryWebsite', username);

            // Use 'setDoc' to set the document content
            await setDoc(docRef, { username });

            console.log("Document successfully written with the name: ", username);

            // Reset form (if ref exists)
            if (signupFormRef.current) {
                signupFormRef.current.reset();
            }
        } catch (error) {
            console.error("Error writing document: ", error);
            throw new Error(error);
        }
    };

    // Sign Up
    const handleSignUp = async (e) => {
        e.preventDefault();

        const email = signupFormRef.current?.email.value; // Access email input via ref
        const password = signupFormRef.current?.password.value;

        if (!email || !password) {
            console.error("Email or Password is missing");
            return;
        }

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            console.log("User created: ", cred.user);

            // Call handleUsername AFTER user creation succeeds
            await handleUsername();

            // Reset the form (if ref exists)
            if (signupFormRef.current) {
                signupFormRef.current.reset();
            }

            goHome();// Navigate to home after successful registration

            window.alert("You are now registered");
        }
        catch (err) {
            console.error("Error during sign-up: ", err.message);
            window.alert(err.message);
        }
    };

    return (
        <div id="SignUp">
            <h1>Sign Up in Library:</h1>
            <form id="SignUpForm" ref={signupFormRef} onSubmit={handleSignUp}>
                <input type="email" name="email" placeholder="Email:" required />
                <input type="password" name="password" placeholder="Password:" required />
                <input type="text" name="username" placeholder="Username:" />
                <button type="submit" id="SignUpButton">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUp;