import React, { useEffect, useState } from 'react';
import { getFirestore, collection, doc, getDocs } from 'firebase/firestore';
import {Link} from "react-router-dom";

const MyBooks = () => {
    const [books, setBooks] = useState([]); // All books fetched from Firestore
    const [filteredBooks, setFilteredBooks] = useState([]); // Books matching the search query
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const db = getFirestore();

    // Fetch books when the component mounts
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Get the email from localStorage
                const email = localStorage.getItem('emailL') || localStorage.getItem('emailS');
                if (!email) {
                    console.error('No email found in localStorage');
                    return;
                }

                // Reference the user's document
                const userDocRef = doc(db, 'LibraryWebsite', email);
                const booksCollectionRef = collection(userDocRef, 'books');

                // Retrieve all documents in the 'books' subcollection
                const querySnapshot = await getDocs(booksCollectionRef);
                const booksData = querySnapshot.docs
                    .filter(doc => doc.id !== 'exampleBook') // Exclude the document named 'exampleBook'
                    .map(doc => ({ id: doc.id, ...doc.data() })); // Map to an array of books with their data

                setBooks(booksData); // Set the books state with the fetched data
                setFilteredBooks(booksData); // Initialize the filtered books state
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        fetchBooks(); // Fetch the books on component mount
    }, [db]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase(); // Convert input to lowercase
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
                {/* Search input field */}
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
                            <Link to={'/Home/MyBookDetail?id='+book.id}>Look Detail</Link>
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