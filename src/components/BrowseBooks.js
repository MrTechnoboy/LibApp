import React, { Fragment, useState } from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";
import {Link} from "react-router-dom";

const BrowseBooks = () => {
    const [q, setQ] = useState("Space");

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

                // Paginate only if there are more results available
                if (pages.length * maxResults < totalItems) {
                    return pages.length * maxResults; // Compute the `startIndex` for the next page
                }

                return undefined; // End of pagination
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
                {isLoading && <div>Loading...</div>}
                {isFetching && <div>Fetching...</div>}
                {isFetchingNextPage && <div>Fetching next page...</div>}
                {isError && <div>Error: {error.message}</div>}
                {data?.pages.map((group, i) => (
                    <div id="Book" key={i}>
                        <Fragment key={i}>
                            {group.data.items.map((item) => (
                                <div key={item.id}>
                                    <h1>{item.volumeInfo.title}</h1>
                                    {(item.volumeInfo.authors ||[]).map((author, index)=>(
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