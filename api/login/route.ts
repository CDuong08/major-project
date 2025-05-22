import { NextRequest, NextResponse } from 'next/server';
import clientPromise from "../connection/mongodb";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  try {
    const client = await clientPromise;
    const db = client.db("EmployeeInfo");
    const collection = db.collection("Employees");

    const user = await collection.findOne({ email, password });

    if (user) {
      return NextResponse.json({
        success: true,
        message: "Login successful",
        is_manager: user.is_manager
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
