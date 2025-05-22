import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../connection/mongodb"; 

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db("EmployeeInfo");
        const collection = db.collection("Assignment times");
        const document = await collection.findOne({ _id: "schedule" });

        return NextResponse.json({
            success: true,
            assignments: document?.assignments || {}
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: (err as Error).message },
            { status: 500 }
        );
    }
}
