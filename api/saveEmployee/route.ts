import { NextRequest, NextResponse } from 'next/server';
import clientPromise from "../connection/mongodb";

// PUT - Update/Create Employee
export async function PUT(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, message: "Email, name and password are all required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("EmployeeInfo");
    const collection = db.collection("Employees");
    // Since only employees can be made, by default is_manager is false
    var is_manager = false;

    // updateOne with upsert: true
    const result = await collection.updateOne(
      { email },
      { $set: { name, password, is_manager } },
      { upsert: true }
    );

    if (result.matchedCount > 0) {
      // found and updated
      return NextResponse.json({ success: true, message: "Employee updated" });
    } else if (result.upsertedCount > 0) {
      // did not exist, so inserted
      return NextResponse.json({ success: true, message: "Employee created" });
    } else {
      // strange edge case
      return NextResponse.json(
        { success: false, message: "No changes made" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Error upserting employee:", err);
    return NextResponse.json(
      { success: false, message: "Failed to upsert employee" },
      { status: 500 }
    );
  }
}

// DELETE - Delete Employee
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("EmployeeInfo");
    const collection = db.collection("Employees");

    const result = await collection.deleteOne({ email });

    if (result.deletedCount > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }
  } catch (err) {
    console.error("Error deleting employee:", err);
    return NextResponse.json({ success: false, message: "Failed to delete employee" }, { status: 500 });
  }
}
