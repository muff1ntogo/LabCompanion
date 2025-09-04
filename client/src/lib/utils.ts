import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));

// Utility function for corner styles
export function getCornerStyle(cornerStyle: 'rounded' | 'sharp') {
  return cornerStyle === 'rounded' ? 'rounded-lg' : 'rounded-none';
}

export { getLocalStorage, setLocalStorage };
