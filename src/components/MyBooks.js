import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import {db} from "./firebaseConfig";
import { Link } from "react-router-dom";

const MyBooks = () => {
    const [books, setBooks] = useState([]); // All books fetched from Firestore
    const [filteredBooks, setFilteredBooks] = useState([]); // Books matching the search query
    // Initialize `searchQuery` from localStorage
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('myBooksSearchQuery') || '');

    // Persist search query in `localStorage`
    useEffect(() => {
        sessionStorage.setItem('myBooksSearchQuery', searchQuery);
    }, [searchQuery]);

    // Fetch books when the component mounts
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const email = sessionStorage.getItem('emailL') || sessionStorage.getItem('emailS');
                if (!email) {
                    console.error('No email found in sessionStorage');
                    return;
                }

                const userDocRef = doc(db, 'LibraryWebsite', email);
                const booksCollectionRef = collection(userDocRef, 'books');

                const querySnapshot = await getDocs(booksCollectionRef);
                const booksData = querySnapshot.docs
                    .filter(doc => doc.id !== 'exampleBook')
                    .map(doc => ({ id: doc.id, ...doc.data() }));

                setBooks(booksData); // Set the full list of books
                // Filter the initial search result based on `searchQuery` (from localStorage)
                const filtered = booksData.filter(book =>
                    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || // Title matches
                    book.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) // Author matches
                );
                setFilteredBooks(filtered);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        fetchBooks(); // Fetch the books on component mount
    }, [searchQuery]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter the books list based on the search query
        const filtered = books.filter(book =>
            book.title.toLowerCase().includes(query) || // Check if the title matches
            book.authors.some(author => author.toLowerCase().includes(query)) // Check if any author matches
        );

        setFilteredBooks(filtered); // Update the filtered books state
    };

    return (
        <div id="MyBooks">
            <form onSubmit={e => e.preventDefault()}>
                {/* Search input field with persisted value */}
                <input
                    type="text"
                    placeholder="Search your books"
                    name="searchyourbooks"
                    id="searchyourbooks"
                    value={searchQuery}
                    onChange={handleSearchChange} // Handle onchange event
                />
            </form>
            <div id="MyBooksList">
                {/* Display the filtered books */}
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
                        <div key={book.id}>
                            <h1>{book.title}</h1>
                            {book.authors.map((author, index) => (
                                <h2 key={index}>{author}</h2>
                            ))}
                            <Link to={'/Home/MyBookDetail?id=' + book.id}>Look Detail</Link>
                        </div>
                    ))
                ) : (
                    <h1>No books found.</h1>
                )}
            </div>
        </div>
    );
};

export default MyBooks;