import { NextRequest, NextResponse } from 'next/server';
import clientPromise from "../connection/mongodb";

// PUT - Update/Create Employee
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("EmployeeInfo");
    const collection = db.collection("Employees");

    const result = await collection.updateOne(
      { email },
      { $set: { name, password } }
    );

    if (result.matchedCount > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }
  } catch (err) {
    console.error("Error updating employee:", err);
    return NextResponse.json({ success: false, message: "Failed to update employee" }, { status: 500 });
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
