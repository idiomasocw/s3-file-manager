// src/app/page.js
"use client";

import React, { useState } from "react";
import ControlMenu from "../components/ControlMenu";
import FileManager from "../components/FileManager";
import InfoBox from "../components/InfoBox";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPath, setCurrentPath] = useState(""); // Track the current path

  const handleSelect = (item) => setSelectedItem(item);

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
  let destinationFolder = prompt("Enter destination folder path:");
  if (destinationFolder === null) return; // User cancelled the prompt

  // Normalize the destination folder path
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
        onDeleteFolder={deleteFolder} // Pass deleteFolder function
        onDeleteObject={() => deleteObject(selectedItem)} // Pass delete function
        onMoveObject={moveObject} // Pass move function
      />
      <div className="flex flex-grow">
        <div className="flex-grow p-4">
          <FileManager
            onSelect={handleSelect}
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            onDeleteObject={deleteObject} // Pass delete function
            onMoveObject={moveObject} // Pass move function
          />
        </div>
        <div className="w-1/4 p-4 border-l border-gray-200">
          <InfoBox selectedItem={selectedItem} />
        </div>
      </div>
    </div>
  );
}
