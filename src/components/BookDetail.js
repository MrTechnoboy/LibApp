// Imports
import React from "react";
import {useQuery} from "react-query";
import axios from "axios";
import {doc,collection,setDoc} from "firebase/firestore";
import {db} from "./firebaseConfig";

const BookDetail = () => {

    // Get the page's URL id
    const id=new URLSearchParams(window.location.search).get('id');

    const emailL=sessionStorage.getItem('emailL');
    const emailS=sessionStorage.getItem('emailS');
    const email=emailL||emailS;// Get whichever email is found

    const onSuccess=(data)=>{
        console.log('Perform side effects after data fetching',data);
    };

    const onError=(error)=>{
        console.log('Perform side effects after encountering error',error);
    };

    // Make a GET request to the API
    const {isLoading,data,isError,error,isFetching,refetch}=useQuery(
        'query1',
        ()=>{return axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);},
        {
            cacheTime:300000,
            staleTime:0,
            refetchOnMount:true,
            refetchOnWindowFocus:true,
            refetchInterval:false,
            refetchIntervalInBackground:false,
            enabled:true,
            keepPreviousData:true,
            onSuccess,
            onError,
            select:(data)=>{
                return data.data;
            },
        },
    );

    if (isLoading){
        return <h1>Loading...</h1>
    }

    if (isFetching){
        return <h1>Fetching...</h1>
    }

    if (isError){
        return <h1>{error.message}</h1>
    }

    // Get all the fields
    const title=data?.volumeInfo.title;
    const authors=data?.volumeInfo.authors || [];
    const publishedDate=data?.volumeInfo.publishedDate;
    const description=data?.volumeInfo.description;
    const pageCount=data?.volumeInfo.pageCount;
    const averageRating=data?.volumeInfo.averageRating;
    const maturityRating=data?.volumeInfo.maturityRating
    const imageLinks=data?.volumeInfo.imageLinks.thumbnail;
    let epub;
    if (data?.accessInfo.epub.isAvailable===true){
        epub='Available';
    }
    else {
        epub='Not Available';
    }

    // Add to the book to the subcollection books
    const addToBooks=async ()=>{

        if (!email){
            console.log('No email found');
        }

        try {
            // Reference to the user's "books" subcollection
            const booksSubcollectionRef=collection(doc(db,'LibraryWebsite',email),'books');

            // Create a document in the books subcollection with ID=id
            await setDoc(doc(booksSubcollectionRef,id),{
                title,
                authors:authors || [],
                }
            );
            console.log('Book added to the user\'s books');
            window.alert('Book added to the user\'s books');
        }
        catch (error){
            console.log(error.message);
        }
    }

    return(
        <div id={'BookDetail'}>
            <h1>{title}</h1>
            <img src={imageLinks} alt={title}/>
            {(data?.volumeInfo.authors ||[]).map((author, index)=>(
                <h2 key={index}>{author}</h2>
            ))}
            <h3> Published date: {publishedDate}</h3>
            <h2>Genre:</h2>
            {(data?.volumeInfo.categories || []).map((author, index)=>(
                <h2 key={index}>{author}</h2>
            ))}
            <h3>{description}</h3>
            <h3>Maturity Rating: {maturityRating}</h3>
            <h3> Pages: {pageCount}</h3>
            <h3> Avg Rating: {averageRating}</h3>
            <h3> Available: {epub}</h3>
            <button onClick={refetch}>Refresh</button>
            <button onClick={addToBooks}>Add to my books</button>
        </div>
    );
};

export default BookDetail;