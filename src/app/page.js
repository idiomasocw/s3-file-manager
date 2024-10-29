// src/app/page.js
"use client";

import React, { useState, useEffect } from "react";
import ControlMenu from "../components/ControlMenu";
import FileManager from "../components/FileManager";
import InfoBox from "../components/InfoBox";
import { redirectToCognitoLogin } from "../utils/auth"; // import login redirection utility

export default function Home() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPath, setCurrentPath] = useState(""); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    } else if (window.location.search.includes("code=")) {
      const code = new URLSearchParams(window.location.search).get("code");
      fetchToken(code);
    } else {
      redirectToCognitoLogin(); // Redirect to login if not authenticated
    }
  }, []);

  // Fetch Token function after redirection
  const fetchToken = async (code) => {
    const tokenUrl = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_CALLBACK_URL;
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    });

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (response.ok) {
        const { id_token } = await response.json();
        localStorage.setItem("token", id_token);
        setIsAuthenticated(true);
        window.history.replaceState({}, document.title, "/"); // Clean up URL after login
      } else {
        console.error("Failed to fetch token");
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const handleSelect = (item) => setSelectedItem(item);

  // Rest of your functions (addFolder, deleteFolder, deleteObject, moveObject)
  // Add Folder function
  const addFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const response = await fetch("/api/s3/createFolder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: `${currentPath}${folderName}/` }),
      });
      if (response.ok) {
        console.log("Folder created successfully");
        setCurrentPath((prevPath) => prevPath); // Refresh
      } else {
        console.error("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  // Delete Folder function
  const deleteFolder = async () => {
    if (!selectedItem || selectedItem.type !== "folder")
      return alert("Please select a folder to delete.");
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedItem.name}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/s3/deleteFolder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: selectedItem.key }),
      });
      if (response.ok) {
        console.log("Folder deleted successfully");
        setCurrentPath((prevPath) => prevPath); // Refresh
        setSelectedItem(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete folder");
        console.error("Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  // Delete Object function
  const deleteObject = async () => {
    if (!selectedItem) return alert("Please select an item to delete.");
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedItem.name}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/s3/deleteObject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: selectedItem.key }),
      });
      if (response.ok) {
        console.log("Item deleted successfully");
        setCurrentPath((prevPath) => prevPath); // Refresh
        setSelectedItem(null);
      } else {
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Move Object function
  const moveObject = async () => {
    if (!selectedItem) return alert("Please select an item to move.");

    let destinationFolder = prompt("Enter destination folder path:", currentPath);
    if (destinationFolder === null) return; // User cancelled the prompt

    destinationFolder = destinationFolder.trim();
    if (destinationFolder && !destinationFolder.endsWith('/')) {
      destinationFolder += '/';
    }

    try {
      const response = await fetch("/api/s3/moveObject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKey: selectedItem.key,
          destinationKey: `${destinationFolder}${selectedItem.name}`,
        }),
      });
      if (response.ok) {
        console.log("Item moved successfully");
        setCurrentPath((prevPath) => prevPath); // Refresh
        setSelectedItem(null);
      } else {
        console.error("Failed to move item");
      }
    } catch (error) {
      console.error("Error moving item:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <ControlMenu
        onAddFolder={addFolder}
        onDeleteFolder={deleteFolder}
        onDeleteObject={() => deleteObject(selectedItem)}
        onMoveObject={moveObject}
      />
      <div className="flex flex-grow">
        <div className="flex-grow p-4">
          <FileManager
            onSelect={handleSelect}
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            onDeleteObject={deleteObject}
            onMoveObject={moveObject}
          />
        </div>
        <div className="w-1/4 p-4 border-l border-gray-200">
          <InfoBox selectedItem={selectedItem} />
        </div>
      </div>
    </div>
  );
}