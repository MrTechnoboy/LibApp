import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, limit, startAfter } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem("searchQuery") || "");
    const [error, setError] = useState(null);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [lastFetchedPost, setLastFetchedPost] = useState(null);

    const navigate = useNavigate();

    const createPost = () => {
        navigate("/Home/CreatePost");
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
            sessionStorage.setItem("searchQuery", value);
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        debounceSearchChange(e.target.value);
    };

    const fetchPosts = async (isLoadingMore = false, resetSearch = false) => {
        try {
            setLoading(true);
            setError(null);

            const email = sessionStorage.getItem("emailS") || sessionStorage.getItem("emailL");
            if (!email) {
                throw new Error("User email not found in sessionStorage.");
            }

            const userPostsRef = collection(db, "LibraryWebsite", email, "posts");
            let postsQuery;

            if (isLoadingMore && lastFetchedPost) {
                postsQuery = query(userPostsRef, limit(10), startAfter(lastFetchedPost));
            } else {
                postsQuery = query(userPostsRef, limit(10));
            }

            const querySnapshot = await getDocs(postsQuery);

            // Check for empty results
            if (querySnapshot.empty) {
                if (!isLoadingMore) {
                    setPosts([]);
                    setFilteredPosts([]);
                }
                setHasMorePosts(false);
                return;
            }

            const fetchedPosts = [];
            querySnapshot.forEach((doc) => {
                if (doc.id === "examplePost") return;

                const postData = doc.data();
                const timestamp = postData.timestamp?.toDate();

                fetchedPosts.push({
                    id: doc.id,
                    text: postData.text || "No text provided",
                    timestamp: timestamp ? timestamp.toLocaleString() : "No timestamp available",
                });
            });

            const lastPost = querySnapshot.docs[querySnapshot.docs.length - 1];
            setLastFetchedPost(lastPost);

            if (isLoadingMore) {
                setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
                setFilteredPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
            } else {
                setPosts(fetchedPosts);

                if (resetSearch || searchQuery === "") {
                    setFilteredPosts(fetchedPosts);
                } else {
                    const filtered = fetchedPosts.filter((post) =>
                        post.id.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setFilteredPosts(filtered);
                }

                setHasMorePosts(true);
            }
        } catch (error) {
            let userMessage = "Something went wrong while fetching posts.";
            // Handle Firestore-specific errors if necessary
            if (error.code === "permission-denied") {
                userMessage = "You do not have permission to access these posts.";
            }
            console.error("Error fetching posts:", error);
            setError(userMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(false, true);
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = posts.filter((post) =>
            post.id.toLowerCase().includes(query)
        );
        setFilteredPosts(filtered);
    }, [searchQuery, posts]);

    const handleResetSearch = () => {
        setSearchQuery("");
        sessionStorage.removeItem("searchQuery");
        setFilteredPosts(posts);
    };

    const handleLoadMore = () => {
        fetchPosts(true);
    };

    const renderPosts = () => {
        if (filteredPosts.length === 0) {
            return (
                <div>
                    <h1>No posts found.</h1>
                    {searchQuery && <button onClick={handleResetSearch}>Reset Search</button>}
                </div>
            );
        }

        return filteredPosts.map((post) => (
            <div key={post.id}>
                <h1>Title: {post.id}</h1>
                <h2>Created at: {post.timestamp}</h2>
                <Link
                    to={`/Home/MyPostDetail?id=${post.id}`}
                    state={{ id: post.id }}
                    aria-label={`View details for post ${post.id}`}
                >
                    View Post
                </Link>
            </div>
        ));
    };

    if (loading && posts.length === 0) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>Error: {error}</h1>;
    }

    return (
        <div id="MyPosts">
            <form>
                <input
                    type="text"
                    placeholder="Search your posts"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Search through your posts" // Accessible search bar
                />
            </form>
            <button onClick={createPost}>+ Create Post</button>
            {renderPosts()}
            <button
                onClick={handleLoadMore}
                disabled={!hasMorePosts || loading}
            >
                {loading ? "Loading..." : "Load More"}
            </button>
        </div>
    );
};

export default MyPosts;