"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout, User } from "@/lib/auth";

interface LeaveUser {
  id: number;
  full_name: string;
  email: string;
}

interface LeaveRequest {
  id: number;
  user: LeaveUser;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: string;
  reason: string;
  status: string;
  annual_leave_balance: string;
  sick_leave_balance: string;
  review_comment: string | null;
  reviewed_at: string;
  created_at: string;
  reviewed_by: number;
}

interface EmployeeBalance {
  employee: {
    id: number;
    full_name: string;
    email: string;
  };
  annual_leave_balance: number;
  sick_leave_balance: number;
}

interface DashboardData {
  total_employees: number;
  total_leave_requests: number;
  status_counts: {
    pending?: number;
    approved?: number;
    rejected?: number;
  };
  leave_type_counts: {
    annual?: number;
    sick?: number;
    compassionate?: number;
    unpaid?: number;
  };
}

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [employees, setEmployees] = useState<EmployeeBalance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // -----------------------------------
  // AUTH CHECK
  // -----------------------------------
  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    const loadUser = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/auth/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();

        if (data.role !== "admin") {
          router.push("/");
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);

        logout();
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router, token]);

  // -----------------------------------
  // LOAD DASHBOARD DATA
  // -----------------------------------
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [dashRes, empRes, leaveRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/admin/dashboard/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(
            "http://127.0.0.1:8000/api/admin/employee-leave-balances/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://127.0.0.1:8000/api/admin/leave-requests/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        // HANDLE AUTH FAILURE
        if (
          !dashRes.ok ||
          !empRes.ok ||
          !leaveRes.ok
        ) {
          throw new Error("Failed to load dashboard data");
        }

        // DASHBOARD
        const dashData = await dashRes.json();
        setDashboard(dashData);

        // EMPLOYEES
        const empData = await empRes.json();
        setEmployees(empData.results || empData);

        // LEAVES
        const leaveData = await leaveRes.json();
        setLeaves(leaveData.results || leaveData);

      } catch (error) {
        console.error("Dashboard load error:", error);
      }
    };

    loadData();
  }, [token]);

  // -----------------------------------
  // EXPORT REPORTS
  // -----------------------------------
  const exportReport = async (
    type: "csv" | "pdf"
  ) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/admin/reports/export/?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = `leave_report.${type}`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Export error:", error);
    }
  };

  // -----------------------------------
  // LOGOUT
  // -----------------------------------
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // -----------------------------------
  // LOADING STATE
  // -----------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-3xl font-bold text-black">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome back, {user.full_name}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportReport("csv")}
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            Export CSV
          </button>

          <button
            onClick={() => exportReport("pdf")}
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            Export PDF
          </button>

          <button
            onClick={handleLogout}
            className="btn-secondary px-4 py-2 rounded-lg border"
          >
            Logout
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">
            Total Employees
          </p>

          <h2 className="text-3xl font-bold mt-2 text-black">
            {dashboard?.total_employees || 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">
            Total Requests
          </p>

          <h2 className="text-3xl font-bold mt-2 text-black">
            {dashboard?.total_leave_requests || 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">
            Pending Requests
          </p>

          <h2 className="text-3xl font-bold mt-2 text-black">
            {dashboard?.status_counts?.pending || 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">
            Approved Requests
          </p>

          <h2 className="text-3xl font-bold mt-2 text-black">
            {dashboard?.status_counts?.approved || 0}
          </h2>
        </div>

      </div>

      {/* EMPLOYEE BALANCES */}
      <div className="bg-blue-1000 rounded-xl shadow-sm p-6 mb-8 overflow-x-auto text-black">

        <h2 className="text-xl font-semibold mb-4 text-black">
          Employee Leave Balances
        </h2>

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b text-left">
              <th className="py-3">Employee</th>
              <th className="py-3">Email</th>
              <th className="py-3">Annual Leave</th>
              <th className="py-3">Sick Leave</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3">
                  {emp.employee?.full_name}
                </td>

                <td className="py-3">
                  {emp.employee?.email}
                </td>

                <td className="py-3">
                  {emp.annual_leave_balance}
                </td>

                <td className="py-3">
                  {emp.sick_leave_balance}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* LEAVE REQUESTS */}
      <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto text-black">

        <h2 className="text-xl font-semibold mb-4 text-black">
          Recent Leave Requests
        </h2>

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b text-left">
              <th className="py-3">Employee</th>
              <th className="py-3">Leave Type</th>
              <th className="py-3">Status</th>
              <th className="py-3">Start Date</th>
              <th className="py-3">End Date</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3">
                  {leave.user?.full_name}
                </td>

                <td className="py-3 capitalize">
                  {leave.leave_type}
                </td>

                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      leave.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : leave.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>

                <td className="py-3">
                  {leave.start_date}
                </td>

                <td className="py-3">
                  {leave.end_date}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}