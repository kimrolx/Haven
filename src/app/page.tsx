"use client";
import { useState } from "react";

import Header from "@/components/landing_page/Header";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      {/* move this to layout */}
      <NavBar />
      <div className="centered">
        <Header />
      </div>
    </div>
  );
}
