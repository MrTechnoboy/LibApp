import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { getFirestore, doc, collection, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { getApp } from "firebase/app";
import {useNavigate} from "react-router-dom";

const MyBookDetail = () => {

    const id = new URLSearchParams(window.location.search).get("id");

    const navigate = useNavigate();

    const onSuccess = (data) => {
        console.log("Perform side effects after data fetching", data);
    };

    const onError = (error) => {
        console.log("Perform side effects after encountering error", error);
    };

    // Make a GET request to the API
    const { isLoading, data, isError, error, isFetching, refetch } = useQuery(
        "query2",
        () => {
            return axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
        },
        {
            cacheTime: 300000,
            staleTime: 0,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            refetchInterval: false,
            refetchIntervalInBackground: false,
            enabled: true,
            keepPreviousData: true,
            onSuccess,
            onError,
            select: (data) => {
                return data.data;
            },
        }
    );

    if (isLoading) {
        return <h1>Loading...</h1>;
    }

    if (isFetching) {
        return <h1>Fetching...</h1>;
    }

    if (isError) {
        return <h1>{error.message}</h1>;
    }

    // Get all the fields
    const title = data?.volumeInfo.title;
    const publishedDate = data?.volumeInfo.publishedDate;
    const description = data?.volumeInfo.description;
    const pageCount = data?.volumeInfo.pageCount;
    const averageRating = data?.volumeInfo.averageRating;
    const maturityRating = data?.volumeInfo.maturityRating;
    const imageLinks = data?.volumeInfo.imageLinks.thumbnail;
    let epub;
    if (data?.accessInfo.epub.isAvailable === true) {
        epub = "Available";
    } else {
        epub = "Not Available";
    }

    const handleRemove = async () => {
        try {
            // Get the email from localStorage
            const email = sessionStorage.getItem("emailL") || sessionStorage.getItem("emailS");

            if (!email) {
                alert("User email not found in localStorage!");
                return;
            }

            // Initialize Firestore
            const app = getApp(); // Get the default Firebase app
            const db = getFirestore(app);

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
            <h1>{title}</h1>
            <img src={imageLinks} alt={title} />
            {(data?.volumeInfo.authors || []).map((author, index) => (
                <h2 key={index}>{author}</h2>
            ))}
            <h3> Published date: {publishedDate}</h3>
            <h2>Genre:</h2>
            {(data?.volumeInfo.categories || []).map((author, index) => (
                <h2 key={index}>{author}</h2>
            ))}
            <h3>{description}</h3>
            <h3>Maturity Rating: {maturityRating}</h3>
            <h3> Pages: {pageCount}</h3>
            <h3> Avg Rating: {averageRating}</h3>
            <h3> Available: {epub}</h3>
            <button onClick={refetch}>Refresh</button>
            <button onClick={handleRemove}>Remove from my books</button>
        </div>
    );
};

export default MyBookDetail;