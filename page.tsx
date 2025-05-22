"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react'

export default function Login() {

  // Warmup the connection to the mongodb on page load
  useEffect(() => {
    fetch("/api/warmup")
  }, []);

  const router = useRouter();
  let [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit =  async (e: React.FormEvent<HTMLFormElement>) => {    
    e.preventDefault(); 
    email = email.toLowerCase();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
    }),
  });
  
    const result = await res.json();
    if (result.success) {
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("is_manager", String(result.is_manager));
      router.push("/dashboard");
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-0">
      <header>
        <h1 className="text-4xl font-bold mb-6">Welcome to the roster system</h1>
      </header>
      <h1 className="text-4xl font-bold mb-6">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-black p-6 rounded shadow-md w-96"
      >
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-large text-white-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-large text-white-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full mt-4 text-black py-2 bg-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
