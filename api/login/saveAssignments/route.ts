import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../connection/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { _id, assignments } = await req.json();

    if (_id !== "schedule") {
      return NextResponse.json(
        { success: false, message: "Invalid _id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("EmployeeInfo");
    const collection = db.collection("Assignment times");

    // Process the assignments to convert them to the correct structure
    const processedAssignments = assignments.map(({ employee, day, times }) => {
      return {
        employee,
        day,
        times
      };
    });    

    // Upsert the assignments
    await collection.replaceOne(
      { _id: "schedule" },
      { _id: "schedule", assignments: processedAssignments },
      { upsert: true }
    );    

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save assignments:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save assignments" },
      { status: 500 }
    );
  }
}
