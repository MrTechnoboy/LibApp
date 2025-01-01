import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"; // Firestore methods
import {db} from "./firebaseConfig";

const PostDetail = () => {
    const [postText, setPostText] = useState(""); // State to store 'text' field
    const [error, setError] = useState(""); // State to handle errors
    const title = new URLSearchParams(window.location.search).get("id");
    const user = new URLSearchParams(window.location.search).get("username");

    useEffect(() => {

        // Function to fetch the required post
        const fetchPostText = async () => {
            try {
                // Step 1: Query the LibraryWebsite collection for the document with 'username' = user
                const libraryCollectionRef = collection(db, "LibraryWebsite");
                const queryUser = query(libraryCollectionRef, where("username", "==", user));
                const userSnapshot = await getDocs(queryUser);

                if (userSnapshot.empty) {
                    window.alert("No user found with the provided username.");
                    console.error("No user found with the provided username.");
                    setError("No user found with the provided username.");
                    return;
                }

                // Step 2: Get the user's parent document ID
                const userDocId = userSnapshot.docs[0].id; // Assuming 'username' is unique

                // Step 3: Query the posts subcollection for the document with the matching title
                const postDocRef = doc(db, "LibraryWebsite", userDocId, "posts", title);
                const postSnapshot = await getDoc(postDocRef);

                if (postSnapshot.exists()) {
                    // Step 4: Retrieve and set the 'text' field of the post
                    setPostText(postSnapshot.data().text);
                } else {
                    setError("Post not found with the provided title.");
                }
            } catch (e) {
                setError("An error occurred while fetching the post details.");
                console.error(e); // Log any errors for debugging
                window.alert("An error occurred while fetching the post details.");
            }
        };

        fetchPostText();
    }, [title, user]); // Re-run the effect if title or user changes

    return (
        <div id="PostDetail">
            <h1>Post Detail</h1>
            {error ? (
                <h1>{error}</h1>
            ) : (
                <p>{postText ? postText : "Loading..."}</p>
            )}
        </div>
    );
};

export default PostDetail;