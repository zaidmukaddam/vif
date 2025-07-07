import { useState, useEffect, useCallback } from "react";
import { TodoItem } from "@/types";
import { serializeTodo } from "@/lib/utils/todo";

// Custom hook for localStorage sync
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // State to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);

  // Read from localStorage and initialize the state after component is mounted
  useEffect(() => {
    setIsMounted(true);

    try {
      const item = localStorage.getItem(key);
      if (!item) return;

      const parsed = JSON.parse(item, (key, value) => {
        if (key === "date") return new Date(value);
        return value;
      });

      // Handle specific case for TodoItem array
      if (Array.isArray(parsed) && key === "todos") {
        setStoredValue(parsed.map((item: any) => serializeTodo(item as TodoItem)) as T);
      } else {
        setStoredValue(parsed as T);
      }
    } catch (error) {
      console.error("Failed to parse localStorage:", error);
    }
  }, [key]);

  // Return wrapped version of useState's setter function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Only update localStorage if we're on the client and component is mounted
      if (isMounted) {
        localStorage.setItem(key, JSON.stringify(valueToStore, (key, value) => {
          if (key === "date" && value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }));
      }
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [key, storedValue, isMounted]);

  return [storedValue, setValue] as const;
} 