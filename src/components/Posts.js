import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getDocs, collectionGroup, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Helper function to format timestamps
const formatTimestamp = (timestamp, locale = "en-US") => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000).toLocaleString(locale);
};

const Posts = () => {
    const [postsData, setPostsData] = useState([]); // Stores the list of posts
    const [loading, setLoading] = useState(false); // Tracks if data is being fetched
    const [hasMore, setHasMore] = useState(true); // Determines if there are more posts to load
    const [error, setError] = useState(null); // Stores fetch error messages if any

    const lastVisiblePostRef = useRef(null); // Tracks the last document fetched for pagination

    const fetchPosts = useCallback(async () => {
        if (!hasMore) return; // Exit early if no more posts are available
        setLoading(true); // Start the loading indicator
        setError(null); // Clear any previous error

        try {
            // Construct the query, adding `startAfter` if there's a last visible document
            const postsQuery = lastVisiblePostRef.current
                ? query(
                    collectionGroup(db, "posts"),
                    orderBy("timestamp"),
                    startAfter(lastVisiblePostRef.current),
                    limit(20)
                )
                : query(
                    collectionGroup(db, "posts"),
                    orderBy("timestamp"),
                    limit(20)
                );

            const querySnapshot = await getDocs(postsQuery);

            if (querySnapshot.empty) {
                setHasMore(false); // No more posts to fetch
                return;
            }

            const fetchedPosts = querySnapshot.docs.map((postDoc) => {
                const postData = postDoc.data();
                return {
                    postName: postDoc.id || "N/A", // Fallback for missing post names
                    text: postData.text || "No text available", // Fallback for missing text
                    timestamp: postData.timestamp || null, // Preserve null timestamps
                    username: postData.username || "Unknown User", // Fallback for missing usernames
                    email: postData.email || "No Email", // Fallback for missing emails
                };
            });

            // Avoid adding duplicate posts based on `postName`
            setPostsData((prevState) => {
                const existingNames = new Set(prevState.map((post) => post.postName));
                const uniquePosts = fetchedPosts.filter((post) => !existingNames.has(post.postName));
                return [...prevState, ...uniquePosts];
            });

            // Update the lastVisiblePostRef to the last document in the query snapshot
            lastVisiblePostRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load posts. Please try again later."); // Improved user-friendly error message
        } finally {
            setLoading(false); // Stop the loading indicator
        }
    }, [hasMore]);

    // Fetch initial posts on component mount
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Optional cleanup when the component unmounts
    useEffect(() => {
        return () => {
            lastVisiblePostRef.current = null; // Clear the last visible post ref
        };
    }, []);

    return (
        <div id="Posts">
            <h1>Posts</h1>

            {error && (
                <div>
                    <p style={{ color: "red" }}>{error}</p>
                    <button onClick={fetchPosts} style={{ color: "blue", cursor: "pointer" }}>
                        Retry
                    </button>
                </div>
            )}

            {loading && postsData.length === 0 && <p>Loading posts...</p>}

            {postsData.length > 0 ? (
                <ul>
                    {postsData.map((post, index) => (
                        <li key={post.postName || index}> {/* Use `postName` as key for uniqueness */}
                            <p>
                                <strong>Post Name:</strong> {post.postName}
                            </p>
                            <p>
                                <strong>Text:</strong> {post.text}
                            </p>
                            <p>
                                <strong>Timestamp:</strong> {formatTimestamp(post.timestamp)}
                            </p>
                            <p>
                                <strong>Username:</strong> {post.username}
                            </p>
                            <p>
                                <strong>Email:</strong> {post.email}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                !loading && !error && <p>No posts found.</p>
            )}

            {/* Show loading indicator or "Load More" button */}
            {hasMore && !error && (
                <button
                    onClick={fetchPosts}
                    disabled={loading}
                    aria-busy={loading}
                    aria-disabled={loading}
                >
                    {loading ? "Loading..." : "Load More"}
                </button>
            )}

            {/* Show a secondary loading indicator while fetching more posts */}
            {loading && postsData.length > 0 && (
                <p style={{ fontStyle: "italic" }}>Loading more posts...</p>
            )}
        </div>
    );
};

export default Posts;