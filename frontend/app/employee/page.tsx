"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/api";
import { logout } from "@/lib/auth";
import { User } from "@/lib/auth";

export default function EmployeePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const loadUser = async () => {
      try {
        const data = await getProfile(token);

        // 🔐 Role protection (employee ONLY)
        if (data.role !== "employee") {
          if (data.role === "admin") router.push("/admin");
          else router.push("/supervisor");
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading employee dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">
          Employee Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="btn btn-secondary"
        >
          Logout
        </button>
      </div>

      {/* PROFILE */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">My Profile</h2>

        <div className="space-y-2">
          <p>
            <span className="font-medium">Name:</span> {user.full_name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-medium">Leave Balance:</span>{" "}
            {user.annual_leave_balance ?? "N/A"} days
          </p>
        </div>
      </div>

      {/* EMPLOYEE ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="card p-4">
          <h3 className="font-semibold">Apply for Leave</h3>
          <p className="text-sm text-gray-500">
            Submit a new leave request
          </p>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold">My Leave History</h3>
          <p className="text-sm text-gray-500">
            View past and pending requests
          </p>
        </div>

      </div>
    </div>
  );
}