import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";
import { Link } from "react-router-dom";

const BrowseBooks = () => {
    // Retrieve saved query from localStorage or default to "Space"
    const [q, setQ] = useState(() => sessionStorage.getItem("searchQuery") || "Space");

    // Update localStorage whenever `q` changes
    useEffect(() => {
        sessionStorage.setItem("searchQuery", q);
    }, [q]);

    const fetchBooks = ({ pageParam = 0, queryKey }) => {
        const searchQuery = queryKey[1]; // Extract `q` from the queryKey
        const maxResults = 10; // Results per page

        return axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&startIndex=${pageParam}&maxResults=${maxResults}`
        );
    };

    const {
        isLoading,
        isFetching,
        isFetchingNextPage,
        isError,
        error,
        data,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery(
        ["infinite", q], // Query key includes `q`
        fetchBooks, // Fetch function
        {
            getNextPageParam: (_lastPage, pages) => {
                const maxResults = 10; // Match maxResults from the API call
                const totalItems = _lastPage.data.totalItems || 0;

                if (pages.length * maxResults < totalItems) {
                    return pages.length * maxResults; // Compute the `startIndex` for the next page
                }

                return undefined;
            },
        }
    );

    return (
        <div id="BrowseBooks">
            <form
                onSubmit={(e) => {
                    e.preventDefault(); // Prevent page reload
                }}
            >
                <input
                    type="text"
                    placeholder="Search for books"
                    name="searchBooks"
                    id="searchBooks"
                    required
                    value={q}
                    onChange={(e) => setQ(e.target.value)} // Update `q` state
                />
            </form>
            <div id="booksList">
                {isLoading && <h1>Loading...</h1>}
                {isFetching && <h1>Fetching...</h1>}
                {isFetchingNextPage && <h1>Fetching next page...</h1>}
                {isError && <h1>Error: {error.message}</h1>}
                {data?.pages.map((group, i) => (
                    <div id="Book" key={i}>
                        <Fragment key={i}>
                            {group.data.items.map((item) => (
                                <div key={item.id}>
                                    <h1>{item.volumeInfo.title}</h1>
                                    {(item.volumeInfo.authors || []).map((author, index) => (
                                        <h2 key={index}>{author}</h2>
                                    ))}
                                    <Link to={`/Home/BookDetail?id=${item.id}`}>Look Details</Link>
                                </div>
                            ))}
                        </Fragment>
                    </div>
                ))}
                <button
                    disabled={!hasNextPage}
                    onClick={() => fetchNextPage()} // Explicitly call the fetch next page
                >
                    Load more
                </button>
            </div>
        </div>
    );
};

export default BrowseBooks;