// ErrorBoundary.js
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import {useNavigate} from "react-router-dom";

function ErrorFallback({ error,}) {

    const navigate=useNavigate();

    // Go to front page
    const reset=()=>{
        navigate('/',{replace:true})
        window.location.reload();
    };

    return (
        <div role="alert" id={'ErrorBoundary'}>
            <h1>Something went wrong:</h1>
            <h2>{error.message}</h2>
            <button onClick={reset}>Try again</button>
        </div>
    );
}

function ErrorBoundary({ children }) {
    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Reset state or perform any other action on reset
                // For example, you might want to reset the application state
            }}
            onError={(error, errorInfo) => {
                // Handle the error here, such as logging to an error reporting service
                console.error("Error captured by Error Boundary:", error, errorInfo);
            }}
            >
            {children}
        </ReactErrorBoundary>
    );
}

export default ErrorBoundary;