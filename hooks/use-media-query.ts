"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      
      // Update the state initially
      setMatches(media.matches);
      
      // Define a callback for handling media query changes
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Add the listener
      media.addEventListener("change", listener);
      
      // Remove listener on cleanup
      return () => {
        media.removeEventListener("change", listener);
      };
    }
    
    return undefined;
  }, [query]);
  
  return matches;
} 