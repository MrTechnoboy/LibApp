// Imports
import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { doc, collection, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";

const BookDetail = () => {

    const id=new URLSearchParams(window.location.search).get("id");

    const navigate = useNavigate();

    // Get logged-in user email from sessionStorage
    const email = sessionStorage.getItem("emailL") || sessionStorage.getItem("emailS");

    // React Query: Fetch Book Data
    const { isLoading, data, isError, error, isFetching, refetch } = useQuery(
        "bookDetail", // Descriptive query key
        () => axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`), // Fetch function
        {
            cacheTime: 300000,
            staleTime: 0,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            refetchInterval: false,
            enabled: true,
            keepPreviousData: true,

            onSuccess: (data) => {
                console.log("Data fetched successfully:", data);
                },
            onError: (error) => {
                console.error("Error fetching data:", error);
                },
            select: (response) => response.data, // Extract the main object
        },
    );


    // Handle loading and error states
    if (isLoading) {
        return <h1>Loading...</h1>;
    }

    if (isError) {
        return (
            <div>
                <h1>An error occurred while fetching book details.</h1>
                <p>{error?.message || "Unknown error occurred. Please try again later."}</p>
                <button onClick={() => navigate("/Home")}>Go Back</button>
            </div>
        );
    }

    if (isFetching) {
        return <h1>Fetching...</h1>;
    }

    // Destructure relevant fields from response
    const {
        title,
        authors = [],
        publishedDate,
        description,
        pageCount,
        averageRating,
        maturityRating,
        imageLinks,
        categories = [],
    } = data?.volumeInfo || {};

    const image = imageLinks?.thumbnail || "default-image-url.jpg"; // Fallback for missing images
    const epub = data?.accessInfo.epub.isAvailable ? "Available" : "Not Available";

    // Add the book to the user's Firebase "books" subcollection
    const addToBooks = async () => {
        if (!email) {
            window.alert("Please log in to your account to add books.");
            return;
        }

        try {
            // Reference to the user's books collection
            const booksSubcollectionRef = collection(doc(db, "LibraryWebsite", email), "books");

            // Create a document in the subcollection with additional book fields
            await setDoc(doc(booksSubcollectionRef, id), {
                title: title || "N/A",
                authors,
            });
            console.log("Book added successfully to the user's library.");
            window.alert("Book added to your library!");
        } catch (error) {
            console.error("Error adding book to user's library:", error);
            window.alert("Failed to add book. Please try again.");
        }
    };

    // JSX for rendering book details
    return (
        <div id="BookDetail">
            <h1>{title || "No title available"}</h1>
            <img
                src={image}
                alt={title || "Book cover"}
            />
            <div>
                {authors.length > 0 ? (
                    authors.map((author, index) => <h2 key={index}>{author}</h2>)
                ) : (
                    <h2>No authors found</h2>
                )}
            </div>
            <h3>Published Date: {publishedDate || "Unknown"}</h3>
            <h3>
                Genre: {categories.length > 0 ? categories.join(", ") : "No genre information available"}
            </h3>
            <p>{description || "No description available for this book."}</p>
            <h3>Maturity Rating: {maturityRating || "N/A"}</h3>
            <h3>Pages: {pageCount || "N/A"}</h3>
            <h3>Average Rating: {averageRating || "N/A"}</h3>
            <h3>
                Epub Availability:{" "}
                <span style={{ color: epub === "Available" ? "green" : "red" }}>{epub}</span>
            </h3>
            <div>
                <button onClick={refetch}>Refresh</button>
                <button onClick={addToBooks} disabled={!email}>
                    {email ? "Add to My Books" : "Log in to Add Books"}
                </button>
            </div>
        </div>
    );
};

export default BookDetail;