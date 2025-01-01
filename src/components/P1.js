// Imports
import React from "react";
import { Link } from "react-router-dom";

const P1 = () => {
    return (
        <main id="P1" aria-labelledby="page-title">
            <h1 id="page-title">Welcome to the Library</h1>
            <section aria-labelledby="new-user">
                <h2 id="new-user">If you're new here:</h2>
                <Link to="/SignUp" replace={true} aria-label="Sign up for a new account">
                    Sign Up Here
                </Link>
            </section>
            <section aria-labelledby="existing-user">
                <h2 id="existing-user">Already a user?</h2>
                <Link to="/LogIn" replace={true} aria-label="Log in to your account">
                    Log In Here
                </Link>
            </section>
        </main>
    );
};

export default P1;