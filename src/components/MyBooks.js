import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Link } from 'react-router-dom';

const MyBooks = () => {
    const [books, setBooks] = useState([]); // State to hold books
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('myBooksSearchQuery') || ''); // Persistent search query

    // Pagination State
    const [lastDoc, setLastDoc] = useState(null); // Tracks the last document in the current batch
    const [isNextPageAvailable, setIsNextPageAvailable] = useState(false); // Determines if a next page is available
    const booksPerPage = 5; // Number of books to load per page
    const excludedBookId = 'exampleBook'; // Exclude this document ID

    // Fetch books function
    const fetchBooks = async (direction = 'init') => {
        try {
            const email = sessionStorage.getItem('emailL') || sessionStorage.getItem('emailS');
            if (!email) throw new Error('User email not found in sessionStorage.');

            const userDocRef = doc(db, 'LibraryWebsite', email); // Reference to user-specific document
            const booksCollectionRef = collection(userDocRef, 'books'); // Reference to books subcollection

            let booksQuery;

            // Query conditions for initial fetch or pagination
            if (direction === 'init') {
                booksQuery = query(booksCollectionRef, orderBy('title', 'asc'), limit(booksPerPage));
            } else if (direction === 'next') {
                booksQuery = query(
                    booksCollectionRef,
                    orderBy('title', 'asc'),
                    startAfter(lastDoc), // Start after the last fetched document
                    limit(booksPerPage)
                );
            }

            const querySnapshot = await getDocs(booksQuery);

            if (!querySnapshot.empty) {
                const booksData = querySnapshot.docs
                    .filter((doc) => doc.id !== excludedBookId) // Exclude the document with the ID "ExampleBook"
                    .map((doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            title: data.title || 'Untitled Book', // Fallback for missing title
                            authors: data.authors || [], // Fallback for missing authors
                        };
                    });

                // Update state with the filtered data
                setBooks(booksData);

                // Save the last document of the current batch
                setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

                // Check whether the next page is available
                const nextQuery = query(
                    booksCollectionRef,
                    orderBy('title', 'asc'),
                    startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]),
                    limit(1) // Fetch 1 document to check if more pages exist
                );
                const nextQuerySnapshot = await getDocs(nextQuery);
                setIsNextPageAvailable(!nextQuerySnapshot.empty);
            } else {
                setBooks([]); // No books found
                setIsNextPageAvailable(false); // No more pages
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    // Fetch books when component is mounted
    useEffect(() => {
        fetchBooks('init');
    }, []); // Empty dependency array ensures this runs only on component mount

    // Handle search changes
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
        sessionStorage.setItem('myBooksSearchQuery', e.target.value.toLowerCase());
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
                />
            </form>

            {/* Book List */}
            <div id="MyBooksList">
                {filteredBooks && filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                        <div key={book.id}>
                            <h1>{book.title}</h1>
                            {Array.isArray(book.authors) && book.authors.length > 0 ? (
                                book.authors.map((author, index) => (
                                    <h2 key={index}>{author}</h2>
                                ))
                            ) : (
                                <h2>No authors available</h2>
                            )}
                            <Link to={`/Home/MyBookDetail?id=${book.id}`}>Look Detail</Link>
                        </div>
                    ))
                ) : (
                    <h1>No books found.</h1>
                )}
            </div>
            {/* Pagination Controls */}
            <button
                onClick={() => fetchBooks('init')} // Restart pagination from the beginning
                disabled={false} // You can add a condition for this if needed
                style={{ marginRight: '10px' }}
            >
                First Page
            </button>
            <button
                onClick={() => fetchBooks('next')}
                disabled={!isNextPageAvailable}
            >
                Next Page
            </button>
        </div>
    );
};

export default MyBooks;