import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

const MyBooks = () => {
    const [books, setBooks] = useState([]); // Initial state for book list
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('myBooksSearchQuery') || ''); // Persistent search query
    const [lastDoc, setLastDoc] = useState(null); // Tracks the last document in the current batch
    const [isNextPageAvailable, setIsNextPageAvailable] = useState(false); // Determines if a next page exists
    const [isLoading, setIsLoading] = useState(false); // Loading state to handle UI feedback

    const booksPerPage = 5; // Number of books to load per page
    const excludedBookId = 'exampleBook'; // Exclude this document ID

    // Fetch books function
    const fetchBooks = async (direction = 'init') => {
        setIsLoading(true);
        try {
            const email = sessionStorage.getItem('emailL') || sessionStorage.getItem('emailS');
            if (!email) throw new Error('User email not found in sessionStorage.');

            const userDocRef = doc(db, 'LibraryWebsite', email); // User document reference
            const booksCollectionRef = collection(userDocRef, 'books'); // Reference to books subcollection

            let booksQuery;

            // Query conditions for initial fetch or pagination
            if (direction === 'init') {
                booksQuery = query(
                    booksCollectionRef,
                    orderBy('title', 'asc'),
                    limit(booksPerPage + 1) // Check for an extra element for pagination
                );
            } else if (direction === 'next') {
                booksQuery = query(
                    booksCollectionRef,
                    orderBy('title', 'asc'),
                    startAfter(lastDoc), // Start after the last fetched document
                    limit(booksPerPage + 1) // Check for an extra element for pagination
                );
            }

            const querySnapshot = await getDocs(booksQuery);

            if (!querySnapshot.empty) {
                const booksData = querySnapshot.docs
                    .filter((doc) => doc.id !== excludedBookId) // Exclude the specified book
                    .map((doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            title: data.title || 'Untitled Book', // Fallback for missing title
                            authors: data.authors || [], // Fallback for missing authors
                        };
                    });

                // Check if the next page is available (determine by looking for extras)
                if (booksData.length > booksPerPage) {
                    setIsNextPageAvailable(true); // More pages exist
                    booksData.pop(); // Remove the extra book used for checking
                } else {
                    setIsNextPageAvailable(false); // No more pages
                }

                // Update state
                if (direction === 'next') {
                    // Append to the existing list for next page
                    setBooks((prevBooks) => [...prevBooks, ...booksData]);
                } else {
                    // Set fresh data for initial fetch
                    setBooks(booksData);
                }

                // Save the last fetched document
                setLastDoc(querySnapshot.docs[querySnapshot.docs.length - (isNextPageAvailable ? 2 : 1)]);
            } else {
                setBooks([]); // No books found
                setIsNextPageAvailable(false); // No more pages
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    // Debounced Search Query Handler
    const debouncedSearchChange = debounce((value) => {
        setSearchQuery(value.toLowerCase());
        sessionStorage.setItem('myBooksSearchQuery', value.toLowerCase());
    }, 300); // Debounce delay of 300ms

    // Fetch books when component is mounted
    useEffect(() => {
        fetchBooks('init');
    }, []); // Empty dependency array ensures this runs only once on component mount

    // Handle search input change (debounced)
    const handleSearchChange = (e) => {
        const value = e.target.value;
        debouncedSearchChange(value); // Debounce user's input
    };

    // Filter books based on search query
    const filteredBooks = books.filter(
        (book) =>
            book.title.toLowerCase().includes(searchQuery) ||
            book.authors.some((author) => author.toLowerCase().includes(searchQuery))
    );

    return (
        <div id="MyBooks">
            {/* Search Bar */}
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    placeholder="Search your books"
                    name="searchyourbooks"
                    id="searchyourbooks"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Search your books"
                />
            </form>

            {/* Book List */}
            <div id="MyBooksList">
                {isLoading ? (
                    <p>Loading...</p>
                ) : filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                        <div key={book.id}>
                            <h1>{book.title}</h1>
                            {Array.isArray(book.authors) && book.authors.length > 0 ? (
                                book.authors.map((author, index) => <h2 key={index}>{author}</h2>)
                            ) : (
                                <h2>No authors available</h2>
                            )}
                            <Link to={`/Home/MyBookDetail?id=${book.id}`}>Look Detail</Link>
                        </div>
                    ))
                ) : searchQuery ? (
                    <h1>No books match your search.</h1>
                ) : (
                    <h1>No books found.</h1>
                )}
            </div>

            {/* Pagination Controls */}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={() => fetchBooks('init')} // Restart pagination from the beginning
                    disabled={isLoading} // Disable while loading
                    style={{ marginRight: '10px' }}
                >
                    First Page
                </button>
                <button
                    onClick={() => fetchBooks('next')} // Fetch the next page
                    disabled={!isNextPageAvailable || isLoading} // Disable if no next page or loading
                >
                    Next Page
                </button>
            </div>
        </div>
    );
};

export default MyBooks;