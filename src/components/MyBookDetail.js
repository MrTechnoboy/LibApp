import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { doc, collection, deleteDoc, query, where, getDocs } from "firebase/firestore";
import {db} from "./firebaseConfig";
import {useNavigate} from "react-router-dom";

const MyBookDetail = () => {

    const id = new URLSearchParams(window.location.search).get("id");

    const navigate = useNavigate();

    // Get logged-in user email from sessionStorage
    const email = sessionStorage.getItem("emailL") || sessionStorage.getItem("emailS");

    // Make a GET request to the API
    const { isLoading, data, isError, error, isFetching, refetch } = useQuery(
        "myBookDetail",
        () => {return axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);},
        {
            cacheTime: 300000,
            staleTime: 0,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            refetchInterval: false,
            refetchIntervalInBackground: false,
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

    if (isLoading) {
        return <h1>Loading...</h1>;
    }

    if (isFetching) {
        return <h1>Fetching...</h1>;
    }

    if (isError) {
        return(
        <div>
            <h1>An error occurred while fetching book details.</h1>
            <p>{error?.message || "Unknown error occurred. Please try again later."}</p>
            <button onClick={() => navigate("/Home")}>Go Back</button>
        </div>
        );
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

    const handleRemove = async () => {
        try {

            if (!email) {
                alert("User email not found in localStorage!");
                return;
            }

            // Reference to the books subcollection
            const booksRef = collection(db, "LibraryWebsite", email, "books");

            // Query for the book with the matching title
            const q = query(booksRef, where("title", "==", title));
            const querySnapshot = await getDocs(q);

            // Delete the document(s)
            querySnapshot.forEach(async (docSnapshot) => {
                // Get the document ID and delete it
                const bookDoc = doc(db, "LibraryWebsite", email, "books", docSnapshot.id);
                await deleteDoc(bookDoc);
                console.log(`Book with ID: ${docSnapshot.id} has been deleted.`);
            });

            alert("Book removed successfully.");
            navigate("/Home/MyBooks");
        } catch (error) {
            console.error("Error removing book:", error);
        }
    };

    return (
        <div id={"MyBookDetail"}>
            <h1>{title || 'No title available'}</h1>
            <img src={image} alt={title}/>
            <div>
                {authors.length > 0 ? (
                    authors.map((author, index) => <h2 key={index}>{author}</h2>)
                ) : (
                    <h2>No authors found</h2>
                )}
            </div>
            <h3> Published date: {publishedDate || 'Unknown'}</h3>
            <h3>
                Genre: {categories.length > 0 ? categories.join(", ") : "No genre information available"}
            </h3>
            <h3>{description || 'No description for this book'}</h3>
            <h3>Maturity Rating: {maturityRating || 'N/A'}</h3>
            <h3> Pages: {pageCount || 'N/A'}</h3>
            <h3> Avg Rating: {averageRating || 'N/A'}</h3>
            <h3>
                Epub Availability:{" "}
                <span style={{color: epub === "Available" ? "green" : "red"}}>{epub}</span>
            </h3>
            <button onClick={refetch}>Refresh</button>
            <button onClick={handleRemove} disabled={!email}>
                {email ? "Remove from my books" : "Log in to Remove Book"}
            </button>
        </div>
    );
};

export default MyBookDetail;