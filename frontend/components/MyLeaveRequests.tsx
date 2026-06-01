"use client";

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

type Props = {
  requests: LeaveRequest[];
};

export default function MyLeaveRequests({
  requests,
}: Props) {

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

  return (
    <div className="card p-6 w-full overflow-x-auto">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          My Leave Requests
        </h2>

        <p className="text-sm text-gray-500">
          Total Requests: {requests.length}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No leave requests found.
        </div>
      ) : (
        <table className="w-full border-collapse">

          <thead>
            <tr className="border-b bg-gray-100 text-left">

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
              <tr
                key={request.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3 capitalize">
                  {request.leave_type}
                </td>

                <td className="p-3">
                  {request.start_date}
                </td>

                <td className="p-3">
                  {request.end_date}
                </td>

                <td className="p-3">
                  {request.total_days}
                </td>

                <td className="p-3 max-w-xs truncate">
                  {request.reason}
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </td>

                <td className="p-3">
                  {request.review_comment || "-"}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
}