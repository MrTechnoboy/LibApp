import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, limit, startAfter } from "firebase/firestore"; // Added startAfter for pagination
import { db } from "./firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

const MyPosts = () => {
    const [posts, setPosts] = useState([]); // All posts fetched from Firestore
    const [filteredPosts, setFilteredPosts] = useState([]); // Posts to display after filtering
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('searchQuery') || ""); // Get search query from sessionStorage
    const [error, setError] = useState(null); // Error state for better error handling
    const [hasMorePosts, setHasMorePosts] = useState(true); // For "Load More" button and pagination
    const [lastFetchedPost, setLastFetchedPost] = useState(null); // For pagination reference (last document)

    const navigate = useNavigate();

    const createPost = () => {
        navigate('/Home/CreatePost');
    };

    // Debounce function
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    const debounceSearchChange = useCallback(
        debounce((value) => {
            setSearchQuery(value);
            sessionStorage.setItem('searchQuery', value); // Save search query
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        debounceSearchChange(e.target.value); // Debounced search handler
    };

    const fetchPosts = async (isLoadingMore = false, resetSearch = false) => {
        try {
            setLoading(true);
            setError(null);

            const email = sessionStorage.getItem('emailS') || sessionStorage.getItem('emailL');
            if (!email) {
                throw new Error('User email not found in sessionStorage.');
            }

            const userPostsRef = collection(db, 'LibraryWebsite', email, 'posts');
            let postsQuery;

            if (isLoadingMore && lastFetchedPost) {
                // Fetch next set of documents after the last one
                postsQuery = query(userPostsRef, limit(10), startAfter(lastFetchedPost));
            } else {
                // Initial fetch or refreshing all posts
                postsQuery = query(userPostsRef, limit(10));
            }

            const querySnapshot = await getDocs(postsQuery);

            if (querySnapshot.empty) {
                setHasMorePosts(false); // No more posts to load
                return;
            }

            const fetchedPosts = [];
            querySnapshot.forEach((doc) => {
                // Exclude the "examplePost" document
                if (doc.id === 'examplePost') return;

                const postData = doc.data();
                const timestamp = postData.timestamp?.toDate();

                fetchedPosts.push({
                    id: doc.id, // Document name
                    text: postData.text || "No text provided",
                    timestamp: timestamp
                        ? timestamp.toLocaleString()
                        : "No timestamp available", // Format Date
                });
            });

            // Update the last fetched post for pagination
            const lastPost = querySnapshot.docs[querySnapshot.docs.length - 1];
            setLastFetchedPost(lastPost);

            if (isLoadingMore) {
                // Add the new posts to existing list
                setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
                setFilteredPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
            } else {
                // Replace existing posts
                setPosts(fetchedPosts);

                // If resetSearch is true (e.g., initial load), show all fetched posts
                if (resetSearch || searchQuery === "") {
                    setFilteredPosts(fetchedPosts);
                } else {
                    // Filter posts if a search term exists
                    const filtered = fetchedPosts.filter(post =>
                        post.id.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setFilteredPosts(filtered);
                }

                setHasMorePosts(true); // Reset flag for next load
            }
        } catch (error) {
            console.error('Error fetching posts:', error); // Log for debugging
            setError(error.message); // Display error in UI
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchPosts(false, true); // Reset the search and set initial filteredPosts
    }, []);

    // Update filtered posts whenever searchQuery changes
    useEffect(() => {
        const query = searchQuery.toLowerCase(); // Convert query to lowercase for case-insensitive search
        const filtered = posts.filter(post =>
            post.id.toLowerCase().includes(query)
        );
        setFilteredPosts(filtered);
    }, [searchQuery, posts]);

    const handleResetSearch = () => {
        setSearchQuery(""); // Clear the search term
        sessionStorage.removeItem('searchQuery'); // Clear from sessionStorage
        setFilteredPosts(posts); // Show all posts
    };

    const handleLoadMore = () => {
        fetchPosts(true); // Load more posts when "Load More" is clicked
    };

    if (loading && posts.length === 0) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>Error: {error}</h1>; // Display any error
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
                <div>
                    <h1>No posts found.</h1>
                    {searchQuery && (
                        <button onClick={handleResetSearch}>Reset Search</button> // Friendly reset option
                    )}
                </div>
            ) : (
                filteredPosts.map((post) => (
                    <div key={post.id}>
                        <h1>Title: {post.id}</h1>
                        <h2>Created at: {post.timestamp}</h2>
                        <Link to={`/Home/MyPostDetail`} state={{ id: post.id }}>Look Your Post</Link>
                    </div>
                ))
            )}
            <button
                onClick={handleLoadMore}
                disabled={!hasMorePosts || loading} // Disable "Load More" button if no more posts or loading
            >
                {loading ? "Loading..." : "Load More"}
            </button>
        </div>
    );
};

export default MyPosts;