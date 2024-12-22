import React from 'react';
import {Link} from "react-router-dom";

const NotFound=()=>{
    return(
        <div id={'NotFound'}>
            <h1>The page you searched doesn't exist</h1>
            <img src={"img.png"} alt={'Not loading'}/>
            <Link to={-1} >Go Back</Link>
        </div>
    );
};

export default NotFound;