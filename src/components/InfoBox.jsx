// src/components/InfoBox.jsx
import React, { useState } from "react";

const InfoBox = ({ selectedItem }) => {
  const [copied, setCopied] = useState(false); // Track if the URL was copied

  const handleCopyToClipboard = () => {
    const url = `https://d12feitcrqcv25.cloudfront.net/${selectedItem.key}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); // Show confirmation message
      setTimeout(() => setCopied(false), 2000); // Hide after 2 seconds
    }).catch((err) => {
      console.error("Failed to copy: ", err);
    });
  };

  return (
    <div className="p-4 border-l border-gray-200">
      {selectedItem ? (
        <div>
          <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
          <p><strong>Key:</strong> {selectedItem.key}</p>
          <p>
            <strong>URL:</strong>{" "}
            <span
              onClick={handleCopyToClipboard}
              className="text-blue-500 hover:underline cursor-pointer"
              title="Click to copy URL"
            >
              {`https://d12feitcrqcv25.cloudfront.net/${selectedItem.key}`}
            </span>
            {copied && (
              <span className="ml-2 text-green-500 text-sm">Copied!</span>
            )}
          </p>
          <p><strong>Last Modified:</strong> {selectedItem.lastModified}</p>
          <p><strong>Size:</strong> {selectedItem.size} bytes</p>
        </div>
      ) : (
        <p>Select a folder or an object to see basic information about it down below.</p>
      )}
    </div>
  );
};

export default InfoBox;
