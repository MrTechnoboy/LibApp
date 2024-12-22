import React from "react";
import {Link} from "react-router-dom";

const P1=()=>{
    return(
        <div id={'P1'}>
            <h1>Welcome to the Library</h1>
            <h2>If you're new Here:</h2>
            <Link to={'/SignUp'} replace={true}>Sign Up Here</Link>
            <h2>Already a user?</h2>
            <Link to={'/LogIn'} replace={true}>Log In Here</Link>
        </div>
    );
};

export default P1;