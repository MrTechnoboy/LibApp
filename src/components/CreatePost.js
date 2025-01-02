import React, { useState } from "react";
import { collection, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"; // Firestore methods
import {db} from "./firebaseConfig";
import {useNavigate} from "react-router-dom";

const CreatePost = () => {

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Retrieve email from sessionStorage
            const email = sessionStorage.getItem("emailS") || sessionStorage.getItem("emailL");

            if (!email) {
                alert("Email not found in session storage.");
                return;
            }

            // Get the parent document using the email
            const parentDocRef = doc(db, "LibraryWebsite", email);
            const parentDocSnap = await getDoc(parentDocRef);

            if (parentDocSnap.exists()) {
                // Define the subcollection and new document reference
                const postsCollectionRef = collection(parentDocRef, "posts");
                const newDocRef = doc(postsCollectionRef, title);

                // Add the new post to the subcollection
                await setDoc(newDocRef, {
                    text: content,
                    timestamp: serverTimestamp(), // Firebase Server Timestamp
                });

                alert("Post successfully created!");
                setTitle("");
                setContent("");

                navigate("/Home/MyPosts");
            } else {
                alert("No matching parent document found for the email.");
            }
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    return (
        <div id={"CreatePost"}>
            <h1>Create a Post</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor={"title"}>Title</label>
                <input
                    type="text"
                    placeholder="Post Title"
                    name={"title"}
                    id={"title"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <label htmlFor={"content"}>Content</label>
                <textarea
                    placeholder="Post Content"
                    name={"content"}
                    id={"content"}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <button type={"submit"}>Create Post</button>
            </form>
        </div>
    );
};

export default CreatePost;