import React, { useEffect, useState, useCallback } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

const MyBooks = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('myBooksSearchQuery') || '');
    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        try {
            const email = sessionStorage.getItem('emailL') || sessionStorage.getItem('emailS');
            if (!email) throw new Error('User email not found in sessionStorage.');

            const userDocRef = doc(db, 'LibraryWebsite', email);
            const booksCollectionRef = collection(userDocRef, 'books');
            const querySnapshot = await getDocs(booksCollectionRef);

            const booksData = querySnapshot.docs
                .filter(doc => doc.id !== 'exampleBook')
                .map(doc => ({ id: doc.id, ...doc.data() }));

            setBooks(booksData);
            setFilteredBooks(booksData.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase())));
        } catch (error) {
            setError(error.message);
            console.error('Error fetching books:', error);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const debouncedSearch = useCallback(
        debounce((query, booksData) => {
            const filtered = booksData.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.authors.some(author => author.toLowerCase().includes(query))
            );
            setFilteredBooks(filtered);
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        sessionStorage.setItem('myBooksSearchQuery', query);
        debouncedSearch(query, books);
    };

    return (
        <div id="MyBooks">
            {error && <div className="error">{error}</div>}
            <form onSubmit={e => e.preventDefault()}>
                <input
                    type="text"
                    placeholder="Search your books"
                    name="searchyourbooks"
                    id="searchyourbooks"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </form>
            <div id="MyBooksList">
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
                        <div key={book.id}>
                            <h1>{book.title}</h1>
                            {book.authors.map((author, index) => (
                                <h2 key={index}>{author}</h2>
                            ))}
                            <Link to={`/Home/MyBookDetail?id=${book.id}`}>Look Detail</Link>
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