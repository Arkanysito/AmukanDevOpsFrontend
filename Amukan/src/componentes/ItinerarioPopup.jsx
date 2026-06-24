import React from "react";

export default function ItineraryPopup({ section, data, onClose }) {
  if (!section || !data) return null;

  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-blue-500 shadow-lg rounded-lg p-4 w-[320px]">
      <ul className="text-sm space-y-2">
        {data.map((item, index) => (
          <li key={index}>
            <strong>{item.time}</strong>: {item.activity}
          </li>
        ))}
      </ul>
      <button
        onClick={onClose}
        className="mt-4 text-blue-600 hover:underline block mx-auto"
      >
        Cerrar
      </button>
    </div>
  );
}