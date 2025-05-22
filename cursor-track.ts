"use client";

import { useEffect } from "react";

export default function useCursorTrack() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cursor = document.getElementById("cursor");
      if (cursor) {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      }
    };

    document.body.addEventListener("mousemove", handler);

    return () => {
      document.body.removeEventListener("mousemove", handler);
    };
  }, []);
}
