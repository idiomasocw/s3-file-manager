// src/components/FileManager.jsx
"use client";

import React, { useEffect, useState } from "react";
import FolderIcon from "../app/icons/FolderIcon";
import GoBack from "../app/icons/GoBack";
import ObjectIcon from "../app/icons/ObjectIcon";

const FileManager = ({ onSelect, currentPath, setCurrentPath, onDeleteObject, onMoveObject }) => {
  const [items, setItems] = useState([]);
  const [selectedItemKey, setSelectedItemKey] = useState(null); // Track selected item key

  // Fetch bucket contents from API
  const fetchBucketContents = async (prefix = "") => {
    try {
      const response = await fetch(`/api/s3/listObjects?prefix=${prefix}`);
      const data = await response.json();

      if (response.ok) {
        const filteredItems = [...(data.folders || []), ...(data.files || [])].filter(
          (item) => item && item.name
        );
        setItems(filteredItems);
      } else {
        console.error("Failed to fetch bucket contents:", data.error);
      }
    } catch (error) {
      console.error("Error fetching bucket contents:", error);
    }
  };

  // Upload file to the current directory or the selected folder
  const handleDrop = async (e, folderPath = currentPath) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    for (let file of files) {
      const formattedFileName = file.name.replace(/\s+/g, '-');
      const key = `${folderPath}${formattedFileName}`;

      try {
        const response = await fetch(`/api/s3/uploadFile?key=${encodeURIComponent(key)}`, {
          method: "POST",
          body: await file.arrayBuffer(),
        });

        if (response.ok) {
          console.log(`${formattedFileName} uploaded successfully to ${folderPath}`);
          fetchBucketContents(currentPath); // Refresh contents
        } else {
          console.error(`Failed to upload file: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  // Set selected item and call onSelect
  const handleItemClick = (item) => {
    setSelectedItemKey(item.key);
    onSelect(item);
  };

  // Navigate into folders by double-clicking
  const handleDoubleClick = (item) => {
    if (item.type === "folder") {
      setCurrentPath((prevPath) => (prevPath ? `${prevPath}${item.name}/` : `${item.name}/`));
    }
  };

  // Go back one level
  const handleGoBack = () => {
    const newPath = currentPath.slice(0, currentPath.lastIndexOf("/", currentPath.length - 2) + 1);
    setCurrentPath(newPath);
  };

  // Fetch the root content initially and when path changes
  useEffect(() => {
    fetchBucketContents(currentPath);
  }, [currentPath]);

  // Generate breadcrumb navigation
  const breadcrumbs = currentPath
    ? currentPath.split("/").filter(Boolean).map((folder, index, array) => ({
        name: folder,
        path: array.slice(0, index + 1).join("/") + "/",
      }))
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        {currentPath && (
          <button onClick={handleGoBack} className="text-blue-500 hover:underline flex items-center">
            <GoBack className="w-4 h-4 mr-2" />
          </button>
        )}
        <nav className="flex space-x-2">
          <span className="text-gray-500">Root</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <span className="text-gray-500">/</span>
              <button
                onClick={() => setCurrentPath(crumb.path)}
                className="text-blue-500 hover:underline"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div
        className="flex-grow grid grid-cols-auto-fill gap-4 p-4 border border-gray-200 rounded-md"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e)}
      >
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => handleItemClick(item)} // Highlight on click
            onDoubleClick={() => handleDoubleClick(item)}
onContextMenu={(e) => {
  e.preventDefault();
  handleItemClick(item); // Set the selected item
  const action = window.prompt("Enter 'delete' to delete or 'move' to move this item:");
  if (action === "delete") onDeleteObject();
  if (action === "move") onMoveObject();
}}
            className={`cursor-pointer p-2 border rounded flex flex-col items-center ${
              selectedItemKey === item.key
                ? "bg-blue-100 text-blue-700"
                : "border-gray-300 hover:bg-blue-100 hover:text-blue-700"
            }`}
            style={{ maxHeight: "110px" }}
          >
            {item.type === "folder" ? (
              <div className="flex flex-col items-center text-center">
                <FolderIcon className="w-12 h-12 mb-1" />
                <span className="font-semibold text-gray-700 text-sm">{item.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <ObjectIcon className="w-12 h-12 mb-1" />
                <span className="font-semibold text-gray-700 text-sm">{item.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-gray-500 mt-4">Feel free to drop your files inside the desired folder above</p>
    </div>
  );
};

export default FileManager;
