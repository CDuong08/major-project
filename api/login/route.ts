import { NextRequest, NextResponse } from 'next/server';
import * as mongoDB from "mongodb";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password, is_manager } = body;

    try {
        const client = new mongoDB.MongoClient("mongodb+srv://christian:3eLaMQ6N4z51Riza@rostersystem.xg9w7kd.mongodb.net/?retryWrites=true&w=majority&appName=RosterSystem");
        await client.connect();
        const db = client.db("EmployeeInfo");
        const collection = db.collection("Employees");

        const user = await collection.findOne({
            email: email,
            password: password,
            is_manager: is_manager
        })

        await client.close();

        if (user) {
            return NextResponse.json({ success: true, message: "Login successful" });
        } else {
            return NextResponse.json (
                { success: false, message: "Invalid password, email or invalid role"},
                { status: 401}
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: (error as Error).message }, 
        { status: 500 });
    }
}