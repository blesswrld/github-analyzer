"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LoadingContextType {
    isGlobalLoading: boolean;
    setIsGlobalLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);
    return (
        <LoadingContext.Provider
            value={{ isGlobalLoading, setIsGlobalLoading }}
        >
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}
