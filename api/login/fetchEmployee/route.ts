import { NextRequest, NextResponse } from 'next/server';
import clientPromise from "../connection/mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("EmployeeInfo");
    const collection = db.collection("Employees");

    const employees = await collection.find(
        { is_manager: false }, 
        { projection: { name: 1, email: 1, password: 1, _id: 0 } } 
      ).toArray();

    return NextResponse.json({ success: true, employees });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: (error as Error).message }, {
      status: 500
    });
  }
}
