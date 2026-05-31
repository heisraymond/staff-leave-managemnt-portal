"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/api";
import { logout } from "@/lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "employee";
  leaveBalance?: number;
};

type LeaveRequest = {
  id: number;
  employeeName: string;
  type: string;
  status: "pending" | "approved" | "rejected";
};

export default function SupervisorPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // dummy data for now (later comes from Django API)
  const [requests, setRequests] = useState<LeaveRequest[]>([
    { id: 1, employeeName: "John Doe", type: "Annual Leave", status: "pending" },
    { id: 2, employeeName: "Jane Smith", type: "Sick Leave", status: "pending" },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const loadUser = async () => {
      try {
        const data = await getProfile(token);

        // role protection
        if (data.role !== "supervisor") {
          if (data.role === "admin") router.push("/admin");
          else router.push("/employee");
          return;
        }

        setUser(data);
      } catch (error) {
        console.error(error);
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

  const handleAction = (id: number, action: "approved" | "rejected") => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: action } : req
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading supervisor dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">
          Supervisor Dashboard
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
        <h2 className="text-lg font-semibold mb-4">Profile</h2>

        <div className="space-y-2">
          <p><span className="font-medium">Name:</span> {user.name}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">Role:</span> {user.role}</p>
        </div>
      </div>

      {/* LEAVE REQUESTS */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">
          Pending Leave Requests
        </h2>

        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between border p-4 rounded-lg"
            >
              <div>
                <p className="font-medium">{req.employeeName}</p>
                <p className="text-sm text-gray-500">{req.type}</p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      req.status === "pending"
                        ? "text-yellow-500"
                        : req.status === "approved"
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {req.status}
                  </span>
                </p>
              </div>

              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(req.id, "approved")}
                    className="btn btn-primary text-black"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleAction(req.id, "rejected")}
                    className="btn btn-secondary"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}