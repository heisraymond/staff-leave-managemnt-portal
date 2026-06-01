"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/api";
import { logout, User } from "@/lib/auth";

export type LeaveRequest = {
  id: number;
  user: User;

  leave_type: "annual" | "sick" | "compassionate" | "unpaid";

  start_date: string;
  end_date: string;
  total_days: string;

  reason: string;

  status: "pending" | "approved" | "rejected";

  review_comment: string | null;

  annual_leave_balance?: string;
  sick_leave_balance?: string;

  reviewed_at?: string | null;
  created_at?: string;
};

export default function SupervisorPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [message, setMessage] = useState("");

  // -----------------------------
  // LOAD PROFILE + REQUESTS
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      try {
        // LOAD USER
        const profile = await getProfile(token);

        // ROLE PROTECTION
        if (profile.role !== "supervisor") {
          if (profile.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/employee");
          }
          return;
        }

        setUser(profile);

        // LOAD PENDING REQUESTS
        const response = await fetch(
          "http://127.0.0.1:8000/api/leave/pending/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch leave requests");
        }

        const data: LeaveRequest[] = await response.json();

        setRequests(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error("Unknown error occurred");
        }

        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // -----------------------------
  // APPROVE / REJECT
  // -----------------------------
  const handleAction = async (
    id: number,
    action: "approve" | "reject"
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      let body: {
        action: "approve" | "reject";
        comment?: string;
      };

      // REJECT COMMENT
      if (action === "reject") {
        const comment = window.prompt(
          "Enter rejection comment:"
        );

        body = {
          action: "reject",
          comment:
            comment?.trim() || "Request rejected",
        };
      } else {
        body = {
          action: "approve",
        };
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/leave/${id}/action/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data: { message?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Action failed"
        );
      }

      // REMOVE APPROVED/REJECTED REQUEST
      setRequests((prev) =>
        prev.filter((req) => req.id !== id)
      );

      setMessage(
        action === "approve"
          ? "Leave approved successfully ✅"
          : "Leave rejected successfully ❌"
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Something went wrong");
      }
    }
  };

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading supervisor dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  // -----------------------------
  // UI
  // -----------------------------
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
        <h2 className="text-lg font-semibold mb-4">
          Profile
        </h2>

        <div className="space-y-2">
          <p>
            <span className="font-medium">Name:</span>{" "}
            {user.full_name}
          </p>

          <p>
            <span className="font-medium">Email:</span>{" "}
            {user.email}
          </p>

          <p>
            <span className="font-medium">Role:</span>{" "}
            {user.role}
          </p>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="mb-4 rounded-lg bg-white p-4 shadow">
          <p>{message}</p>
        </div>
      )}

      {/* LEAVE REQUESTS */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">
          Pending Leave Requests
        </h2>

        {requests.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No pending leave requests.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="border p-4 rounded-lg bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                {/* LEFT */}
                <div className="space-y-1">
                  <p className="font-semibold capitalize">
                    Name: {req.user.full_name}
                  </p>

                  <p className="font-semibold capitalize">
                    {req.leave_type} Leave
                  </p>

                  <p className="text-sm text-gray-600">
                    {req.start_date} → {req.end_date}
                  </p>

                  <p className="text-sm text-gray-600">
                    Total Days: {req.total_days}
                  </p>

                  <p className="text-sm text-gray-700">
                    Reason: {req.reason}
                  </p>

                  <p className="text-sm">
                    Status:{" "}
                    <span className="text-yellow-600 font-medium">
                      {req.status}
                    </span>
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleAction(req.id, "approve")
                    }
                    className="btn btn-primary text-black"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      handleAction(req.id, "reject")
                    }
                    className="btn btn-secondary"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}