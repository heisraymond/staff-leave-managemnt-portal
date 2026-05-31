"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(email, password);

      setSession(data);

      const role = data.user.role;

      // role-based routing
      switch (role) {
        case "admin":
          router.push("/admin");
          break;
        case "supervisor":
          router.push("/supervisor");
          break;
        default:
          router.push("/employee");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">Please Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button className="btn w-full bg-white text-black border border-gray-300 hover:bg-gray-100 cursor-pointer">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
