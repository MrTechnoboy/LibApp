import React from 'react';
import {Link, Outlet} from "react-router-dom";

const Home = () => {
    return (
        <div id={'Home'}>
            <Link to={'BrowseBooks'}>Search for Books</Link>
            <Link to={'MyBooks'}>My Books</Link>
            <Link to={'Posts'}>Posts</Link>
            <Link to={'MyPosts'}>My Posts</Link>
            <Outlet/>
        </div>
    );
}

export default Home;