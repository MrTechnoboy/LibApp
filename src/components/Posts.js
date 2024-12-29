import React, { useEffect, useState } from 'react';
import { getDocs, getFirestore, collection } from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore();

const Posts = () => {
    const [postsData, setPostsData] = useState([]);

    // Fetch data from Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                const libraryCollection = collection(db, "LibraryWebsite");
                const querySnapshot = await getDocs(libraryCollection);
                const allPosts = [];

                // Loop through user documents
                for (const userDoc of querySnapshot.docs) {
                    const userData = userDoc.data();
                    const { username, em } = userData; // Extract username and email

                    // Access posts subcollection
                    const postsSubcollection = collection(userDoc.ref, "posts");
                    const postsSnapshot = await getDocs(postsSubcollection);

                    postsSnapshot.forEach(postDoc => {
                        // Filter out the "examplePost" document
                        if (postDoc.id === "examplePost") {
                            return; // Skip this document
                        }

                        const postData = postDoc.data();

                        // Convert Firestore timestamp to readable format
                        const timestamp = postData.timestamp;
                        const formattedTimestamp = timestamp
                            ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000).toLocaleString()
                            : "N/A"; // Handle cases where timestamp may not exist

                        allPosts.push({
                            postName: postDoc.id, // Document name
                            text: postData.text,
                            timestamp: formattedTimestamp,
                            username,
                            email: em,
                        });
                    });
                }

                // Set the fetched posts data
                setPostsData(allPosts);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div id="Posts">
            <h1>Posts</h1>
            {postsData.length > 0 ? (
                <ul>
                    {postsData.map((post, index) => (
                        <li key={index}>
                            <p><strong>Post Name:</strong> {post.postName}</p>
                            <p><strong>Text:</strong> {post.text}</p>
                            <p><strong>Timestamp:</strong> {post.timestamp}</p>
                            <p><strong>Username:</strong> {post.username}</p>
                            <p><strong>Email:</strong> {post.email}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No posts found.</p>
            )}
        </div>
    );
};

export default Posts;