import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

const MyPosts = () => {
    const [posts, setPosts] = useState([]); // All posts fetched from Firestore
    const [filteredPosts, setFilteredPosts] = useState([]); // Posts to display after filtering
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(sessionStorage.getItem('searchQuery') || ""); // Get search query from sessionStorage

    const navigate = useNavigate();

    const createPost = () => {
        navigate('/Home/CreatePost');
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Retrieve email from sessionStorage
                const email = sessionStorage.getItem('emailS') || sessionStorage.getItem('emailL');
                if (!email) {
                    console.error('Email not found in sessionStorage.');
                    return;
                }

                // Access to the posts subcollection for the specific user's email
                const userPostsRef = collection(db, 'LibraryWebsite', email, 'posts');
                const querySnapshot = await getDocs(userPostsRef);

                // Process Firebase documents, excluding the "examplePost" document
                const fetchedPosts = [];
                querySnapshot.forEach((doc) => {
                    if (doc.id === 'examplePost') {
                        return; // Skip the document named "examplePost"
                    }

                    const postData = doc.data();
                    const timestamp = postData.timestamp?.toDate(); // Convert Firebase Timestamp to JS Date

                    fetchedPosts.push({
                        id: doc.id, // Document name
                        text: postData.text || "No text provided",
                        timestamp: timestamp ? timestamp.toLocaleString() : "No timestamp available", // Format Date
                    });
                });

                setPosts(fetchedPosts); // Set posts in state
                setFilteredPosts(fetchedPosts); // Initially, show all fetched posts
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Update filtered posts whenever searchQuery changes
    useEffect(() => {
        const query = searchQuery.toLowerCase(); // Convert query to lowercase for case-insensitive search
        const filtered = posts.filter(post =>
            post.id.toLowerCase().includes(query) // Filter posts by their ID (or name)
        );
        setFilteredPosts(filtered);
    }, [searchQuery, posts]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        sessionStorage.setItem('searchQuery', value); // Save search query to sessionStorage
    };

    if (loading) {
        return <h1>Loading...</h1>;
    }

    return (
        <div id="MyPosts">
            <form>
                <input
                    type="text"
                    placeholder="Search your posts"
                    value={searchQuery} // Bind the state to the input value
                    onChange={handleSearchChange} // Update state on change
                />
            </form>
            <button onClick={createPost}>+ Create Post</button>
            {filteredPosts.length === 0 ? (
                <h1>No posts found.</h1>
            ) : (
                filteredPosts.map((post) => (
                    <div key={post.id}>
                        <h1>Title: {post.id}</h1>
                        <h2>Created at: {post.timestamp}</h2>
                        <Link to={`/Home/MyPostDetail?id=${post.id}`}>Look Your Post</Link>
                    </div>
                ))
            )}
            <button>Load More</button>
        </div>
    );
};

export default MyPosts;