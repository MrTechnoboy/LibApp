import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getDocs, collectionGroup, query, orderBy, limit, startAfter, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Link } from "react-router-dom";
import { format } from "date-fns"; // for timestamp formatting

const Posts = () => {
    const [postsData, setPostsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem("postsSearchTerm") || "");

    const lastVisiblePostRef = useRef(null);
    const isFetchingPosts = useRef(false); // Prevents concurrent fetches

    const fetchPosts = useCallback(async () => {
        if (!hasMore || isFetchingPosts.current) return;

        isFetchingPosts.current = true;
        setLoading(true);
        setError(null);

        try {
            const postsQuery = lastVisiblePostRef.current
                ? query(collectionGroup(db, "posts"), orderBy("timestamp"), startAfter(lastVisiblePostRef.current), limit(20))
                : query(collectionGroup(db, "posts"), orderBy("timestamp"), limit(20));

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
                        const parentDocSnap = await getDoc(parentDocRef);
                        if (parentDocSnap.exists()) {
                            const parentData = parentDocSnap.data();
                            username = parentData.username || username;
                            email = parentData.email || email;
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
            isFetchingPosts.current = false;
            setLoading(false);
        }
    }, [hasMore]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        sessionStorage.setItem("postsSearchTerm", searchTerm);
    }, [searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    // Memoized filtered posts for optimization
    const filteredPosts = useMemo(() => {
        return postsData.filter((post) =>
            post.postName.toLowerCase().includes(searchTerm)
        );
    }, [postsData, searchTerm]);

    return (
        <div id="Posts">
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    placeholder="Search posts by name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </form>

            {error && (
                <div aria-live="polite">
                    <h1>{error}</h1>
                    <button onClick={fetchPosts}>Retry</button>
                </div>
            )}

            {loading && postsData.length === 0 && <h1>Loading posts...</h1>}

            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                    <div key={post.postName}>
                        <h1>Title: {post.postName}</h1>
                        <h2>Created at: {post.timestamp ? format(post.timestamp.toDate(), "MMM dd, yyyy HH:mm") : "N/A"}</h2>
                        <h3>User: {post.username}</h3>
                        <Link to={`/Home/PostDetail?id=${post.postName}&username=${post.username}`}>Look Post</Link>
                    </div>
                ))
            ) : (
                !loading && !error && <h1>No posts found.</h1>
            )}

            {hasMore && (
                <button onClick={fetchPosts} disabled={loading} aria-busy={loading}>
                    {loading ? "Loading..." : "Load More"}
                </button>
            )}

            {loading && postsData.length > 0 && <h1>Loading more posts...</h1>}
        </div>
    );
};

export default Posts;