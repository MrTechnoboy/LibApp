import React, { useEffect, useState, useRef, useCallback } from "react";
import { getDocs, collectionGroup, query, orderBy, limit, startAfter, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const Posts = () => {
    const [postsData, setPostsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const lastVisiblePostRef = useRef(null);

    const fetchPosts = useCallback(async () => {
        if (!hasMore) return;
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
                setHasMore(false);
                return;
            }

            const fetchedPosts = await Promise.all(
                querySnapshot.docs.map(async (postDoc) => {
                    const postData = postDoc.data();
                    const parentDocRef = postDoc.ref.parent.parent;

                    let username = "Unknown User";
                    let email = "No Email";

                    if (parentDocRef) {
                        const parentDocSnap = await getDoc(parentDocRef); // Fixed to use getDoc
                        if (parentDocSnap.exists()) {
                            const parentData = parentDocSnap.data();
                            username = parentData.username || "Unknown User";
                            email = parentData.em || "No Email";
                        }
                    }

                    return {
                        postName: postDoc.id || "N/A",
                        text: postData.text || "No text available",
                        timestamp: postData.timestamp || null,
                        username,
                        email,
                    };
                })
            );

            setPostsData((prevState) => {
                const existingNames = new Set(prevState.map((post) => post.postName));
                const uniquePosts = fetchedPosts.filter((post) => !existingNames.has(post.postName));
                return [...prevState, ...uniquePosts];
            });

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

    useEffect(() => {
        return () => {
            lastVisiblePostRef.current = null;
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
                        <li key={post.postName || index}>
                            <p><strong>Post Name:</strong> {post.postName}</p>
                            <p><strong>Text:</strong> {post.text}</p>
                            <p><strong>Timestamp:</strong> {post.timestamp?.toDate().toString() || "N/A"}</p>
                            <p><strong>Username:</strong> {post.username}</p>
                            <p><strong>Email:</strong> {post.email}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                !loading && !error && <p>No posts found.</p>
            )}

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

            {loading && postsData.length > 0 && <p style={{ fontStyle: "italic" }}>Loading more posts...</p>}
        </div>
    );
};

export default Posts;