"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/api";
import { logout } from "@/lib/auth";
import { User } from "@/lib/auth";

type LeaveType = "annual" | "sick" | "compassionate" | "unpaid";

type LeaveForm = {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
};

export default function EmployeePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<LeaveForm>({
    leave_type: "annual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [message, setMessage] = useState("");

  // -----------------------------
  // AUTH + PROFILE LOAD
  // -----------------------------
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
        if (data.role !== "employee") {
          router.push(data.role === "admin" ? "/admin" : "/supervisor");
          return;
        }

        setUser(data);
      } catch (err) {
        console.error("Profile fetch failed", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  // // -----------------------------
  // // CALCULATE WORKING DAYS
  // // -----------------------------
  // const calculateDays = (start: string, end: string) => {
  //   let total = 0;
  //   const current = new Date(start);
  //   const last = new Date(end);

  //   while (current <= last) {
  //     const day = current.getDay();
  //     if (day !== 0 && day !== 6) total++; // exclude weekends
  //     current.setDate(current.getDate() + 1);
  //   }

  //   return total;
  // };

  // -----------------------------
  // SUBMIT LEAVE REQUEST
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch("http://127.0.0.1:8000/api/leave/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMessage = "Failed to submit leave request";

        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data.non_field_errors)) {
          errorMessage = data.non_field_errors[0];
        } else if (Array.isArray(data.leave_balance)) {
          errorMessage = data.leave_balance[0];
        } else {
          const firstError = Object.values(data)[0];

          if (Array.isArray(firstError)) {
            errorMessage = String(firstError[0]);
          } else if (typeof firstError === "string") {
            errorMessage = firstError;
          }
        }

        throw new Error(errorMessage);
      }

      setMessage("Leave request submitted successfully ✅");

      setForm({
        leave_type: "annual",
        start_date: "",
        end_date: "",
        reason: "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Something went wrong");
      }
    }
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading employee dashboard...</p>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Employee Dashboard</h1>

        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {/* PROFILE */}
      <div className="card p-6 mb-6 w-full max-w-2xl mx-auto">
        <h2 className="font-semibold mb-3">My Profile</h2>

        <p>Name: {user.full_name}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Leave Balance: {user.annual_leave_balance ?? "N/A"} days</p>
      </div>

      {/* LEAVE FORM */}
      <div className="card p-6 mb-6 w-full max-w-2xl mx-auto">
        <h2 className="font-semibold mb-4">Apply for Leave</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* TYPE */}
          <select
            className="input"
            value={form.leave_type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                leave_type: e.target.value as LeaveType,
              }))
            }
          >
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="compassionate">Compassionate</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>

          {/* START */}
          <input
            type="date"
            className="input"
            value={form.start_date}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                start_date: e.target.value,
              }))
            }
          />

          {/* END */}
          <input
            type="date"
            className="input"
            value={form.end_date}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                end_date: e.target.value,
              }))
            }
          />

          {/* REASON */}
          <textarea
            className="input"
            placeholder="Reason"
            value={form.reason}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                reason: e.target.value,
              }))
            }
          />

          {/* BUTTON */}
          <button type="submit" className="btn btn-primary w-full text-black">
            Submit
          </button>

          {/* MESSAGE */}
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </form>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">My Leave History</div>
        <div className="card p-4">Leave Calendar</div>
      </div>
    </div>
  );
}
