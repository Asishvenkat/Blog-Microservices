import React from "react";

const Loading = () => {
  return (
    <div className="max-w-[450px] m-auto mt-[200px] text-center flex flex-col gap-2 px-4">
        <p className="text-2xl text-blue-500 font-bold">
             Loading...
        </p>
        <div className="text-sm text-gray-500 font-medium mt-2">
             <p>Waking up backend services...</p>
             <p className="text-xs text-gray-400 mt-1">First load may take 30–50 seconds on Render free tier.</p>
        </div>
    </div>
  );
};

export default Loading;
