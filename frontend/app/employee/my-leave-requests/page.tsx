"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LeaveRequest = {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  review_comment: string | null;
};

export default function MyLeaveRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------------
  // FETCH LEAVE REQUESTS
  // -----------------------------------
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/leave/my/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: LeaveRequest[] = await res.json();

        if (!res.ok) {
          throw new Error("Failed to fetch leave requests");
        }

        setRequests(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  // -----------------------------------
  // STATUS COLORS
  // -----------------------------------
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // -----------------------------------
  // LOADING STATE
  // -----------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading leave requests...</p>
      </div>
    );
  }

  // -----------------------------------
  // ERROR STATE
  // -----------------------------------
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">My Leave Requests</h1>

        <button onClick={() => router.push("/employee")} className="btn btn-secondary cursor-pointer">
          Create Request
        </button>
      </div>

      {/* EMPTY STATE */}
      {requests.length === 0 ? (
        <div className="card p-10 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-3">
            No Leave Requests Found
          </h2>

          <p className="text-gray-500 mb-6">
            You have not submitted any leave requests yet.
          </p>

          <button
            onClick={() => router.push("/employee")}
            className="btn btn-secondary cursor-pointer"
          >
            Create Leave Request
          </button>
        </div>
      ) : (
        /* TABLE */
        <div className="card p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Leave History</h2>

            <p className="text-sm text-gray-500">
              Total Requests: {requests.length}
            </p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-blue-1000 text-left">
                <th className="p-3">Type</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3">Days</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3">Comment</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-blue-900">
                  <td className="p-3 capitalize">{request.leave_type}</td>

                  <td className="p-3">{request.start_date}</td>

                  <td className="p-3">{request.end_date}</td>

                  <td className="p-3">{request.total_days}</td>

                  <td className="p-3 max-w-xs truncate">{request.reason}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        request.status,
                      )}`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td className="p-3">{request.review_comment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
