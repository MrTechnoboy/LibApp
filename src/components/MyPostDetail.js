import React, { useEffect, useState } from 'react';
import { doc, collection, getDoc } from 'firebase/firestore';
import {db} from "./firebaseConfig";

const MyPostDetail = () => {
    // Retrieve the ID from the query parameters
    const id = new URLSearchParams(window.location.search).get('id');

    // State to hold the post text and errors
    const [postText, setPostText] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                console.log("Starting post detail fetch...");

                // Get email from sessionStorage
                const email = sessionStorage.getItem('emailS') || sessionStorage.getItem('emailL');
                if (!email) {
                    throw new Error('No email found in session storage.');
                }
                console.log("Email retrieved from session storage:", email);

                // Reference to the user's document
                const userDocRef = doc(db, 'LibraryWebsite', email);
                console.log("User document reference created.");

                // Reference the specific post in the subcollection
                const postDocRef = doc(collection(userDocRef, 'posts'), id);
                console.log("Post document reference created:", postDocRef);

                // Fetch the post document
                const postDoc = await getDoc(postDocRef);
                if (postDoc.exists()) {
                    console.log("Post document exists. Data:", postDoc.data());
                    const { text } = postDoc.data();
                    setPostText(text); // Set the retrieved text to state
                } else {
                    throw new Error('Post not found.');
                }
            } catch (err) {
                console.error("Error occurred during data fetch:", err.message);
                setError(err.message); // Set error state to display in UI
            }
        };

        fetchPostDetail();
    }, [id]);

    // Render the component based on the state
    return (
        <div id="MyPostDetail">
            <h1>Post Detail</h1>
            {error ? (
                <h1>Error: {error}</h1> // Show error message if there is an error
            ) : postText ? (
                <p>{postText}</p> // Show post text if it has been fetched
            ) : (
                <h1>Loading...</h1> // Show loading message while fetching
            )}
        </div>
    );
};

export default MyPostDetail;