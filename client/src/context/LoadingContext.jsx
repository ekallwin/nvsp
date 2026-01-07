import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loadingCount, setLoadingCount] = useState(0);
    const [message, setMessage] = useState("Please wait. It may take some while");

    const isLoading = loadingCount > 0;

    const showLoading = (msg) => {
        if (msg) setMessage(msg);
        setLoadingCount(prev => prev + 1);
    };

    const hideLoading = () => {
        setLoadingCount(prev => Math.max(0, prev - 1));
        if (loadingCount <= 1) {
            setMessage("Please wait. It may take some while");
        }
    };

    return (
        <LoadingContext.Provider value={{ isLoading, message, showLoading, hideLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
