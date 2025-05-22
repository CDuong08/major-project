import Link from "next/link";

export default function unauthorised() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-0">
            <header>
                <h1 className="text-4xl font-bold mb-6">Unauthorised</h1>
            </header>
            <p className="text-lg">You are not authorised to view this page.</p>
            <Link href="/" className="mt-4 text-blue-500 hover:underline">
                Return to login page  
            </Link>
        </div>
    );
}