// src/components/ControlMenu.jsx
import React from "react";
import NewFolder from "../app/icons/NewFolder";
import DeleteIcon from "../app/icons/DeleteIcon";
import MoveFile from "../app/icons/MoveFile";
import DeleteFolder from "../app/icons/DeleteFolder";

const ControlMenu = ({ onAddFolder, onDeleteFolder, onDeleteObject, onMoveObject }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_CALLBACK_URL;
    const logoutUrl = `${redirectUri}`;
    window.location.href = logoutUrl;
  };

  return (
    <div className="flex space-x-4 p-4 border-b border-gray-200">
      <button onClick={onAddFolder} className="flex items-center space-x-2 hover:bg-gray-100 hover:text-gray-700 p-2 rounded">
        <NewFolder className="w-6 h-6" />
        <span>Add Folder</span>
      </button>
      <button onClick={onDeleteFolder} className="flex items-center space-x-2 hover:bg-gray-100 hover:text-gray-700 p-2 rounded">
        <DeleteFolder className="w-6 h-6" />
        <span>Delete Folder</span>
      </button>
      <button onClick={onMoveObject} className="flex items-center space-x-2 hover:bg-gray-100 hover:text-gray-700 p-2 rounded">
        <MoveFile className="w-6 h-6" />
        <span>Move Object</span>
      </button>
      <button onClick={onDeleteObject} className="flex items-center space-x-2 hover:bg-gray-100 hover:text-gray-700 p-2 rounded">
        <DeleteIcon className="w-6 h-6" />
        <span>Delete Object</span>
      </button>
      <button onClick={handleLogout} className="bg-red-500 text-white rounded px-2 py-1">
        Logout
      </button>
    </div>
  );
};

export default ControlMenu;
