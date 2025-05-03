//* Header.tsx
import React from "react";

const Header = () => (
  <div className="centered">
    <div className="flex flex-1 flex-col items-start justify-center ">
      <h1 className="bg-clip-text text-transparent text-9xl font-semibold bg-gradient-to-r from-[#d9eaf6] to-[#612ad8]">
        Haven
      </h1>
      <h2 className="bg-clip-text text-transparent text-6xl font-semibold bg-gradient-to-r from-[#d9eaf6] to-[#612ad8] ">
        A safe space to chat.
      </h2>
    </div>
  </div>
);

export default Header;
