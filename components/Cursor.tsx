"use client";
import useCursorTrack from "../cursor-track";

export default function Cursor() {
    useCursorTrack();
    return <div className="cursor" id="cursor"></div>;
}