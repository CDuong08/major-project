import { NextResponse } from "next/server";
import clientPromise from "@/app/api/connection/mongodb";

export async function GET() {
  try {
    await clientPromise;
    return NextResponse.json({ status: "connected" });
  } catch (err) {
    return NextResponse.json({ status: "error", error: String(err) }, { status: 500 });
  }
}
