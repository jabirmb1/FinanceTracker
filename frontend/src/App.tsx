/* eslint-disable no-undef */

import React, { useEffect, useState } from "react";

// If TypeScript complains "Cannot find module './App.css'", add a declaration file:
//   src/custom.d.ts  ->  declare module '*.css';
// The line below silences the error until you add that declaration.
 // @ts-ignore
import './App.css';


declare global {
  interface Window {
    chrome: any;
  }
}

const App: React.FC = () => {
  const [extensionId, setExtensionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Check if Chrome APIs are available
    if (typeof window.chrome !== "undefined" && window.chrome.runtime) {
      setExtensionId(window.chrome.runtime.id);

      // Example: send a message to background service worker (you’ll add this later)
      window.chrome.runtime.sendMessage({ type: "HELLO" }, (response: any) => {
        console.log("Background responded:", response);
      });
    } else {
      setMessage("Not running inside Chrome extension context.");
    }
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Finance Tracker Extension</h1>
      <p>🚀 Chrome Extension Base is working!</p>

      {extensionId ? (
        <p>Extension ID: {extensionId}</p>
      ) : (
        <p>{message || "Loading Chrome API..."}</p>
      )}
    </div>
  );
};

export default App;
