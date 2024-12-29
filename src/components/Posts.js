import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getDocs, collectionGroup, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from './firebaseConfig';

const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000).toLocaleString();
};

const Posts = () => {
    const [postsData, setPostsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const lastVisiblePostRef = useRef(null);

    const fetchPosts = useCallback(async () => {
        if (!hasMore) return; // Exit early if no more posts are to be fetched.
        setLoading(true);
        setError(null);

        try {
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
                setHasMore(false); // Stop further fetch attempts
                return;
            }

            const fetchedPosts = querySnapshot.docs.map((postDoc) => {
                const postData = postDoc.data();
                return {
                    postName: postDoc.id,
                    text: postData.text,
                    timestamp: postData.timestamp,
                    username: postData.username || "Unknown User",
                    email: postData.em || "No Email",
                };
            });

            // Filter duplicates based on `postName`
            setPostsData((prevState) => {
                const existingNames = new Set(prevState.map((post) => post.postName));
                const uniquePosts = fetchedPosts.filter((post) => !existingNames.has(post.postName));
                return [...prevState, ...uniquePosts];
            });

            // Update the last document reference
            lastVisiblePostRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];

        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [hasMore]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Optional cleanup: clear state when unmounting
    useEffect(() => {
        return () => {
            setPostsData([]);
            lastVisiblePostRef.current = null;
        };
    }, []);

    return (
        <div id="Posts">
            <h1>Posts</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && postsData.length === 0 && <p>Loading posts...</p>}

            {postsData.length > 0 ? (
                <ul>
                    {postsData.map((post, index) => (
                        <li key={post.postName || index}> {/* `postName` as key for uniqueness */}
                            <p><strong>Post Name:</strong> {post.postName}</p>
                            <p><strong>Text:</strong> {post.text}</p>
                            <p><strong>Timestamp:</strong> {formatTimestamp(post.timestamp)}</p>
                            <p><strong>Username:</strong> {post.username}</p>
                            <p><strong>Email:</strong> {post.email}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                !loading && <p>No posts found.</p>
            )}

            {hasMore && (
                <button onClick={fetchPosts} disabled={loading} aria-busy={loading} aria-disabled={loading}>
                    {loading ? "Loading..." : "Load More"}
                </button>
            )}
        </div>
    );
};

export default Posts;