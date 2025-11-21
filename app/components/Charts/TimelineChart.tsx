"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ProcessedIssue } from "@/app/lib/types";
import { format, parseISO, startOfWeek, addWeeks } from "date-fns";

interface TimelineChartProps {
  issues: ProcessedIssue[];
}

export default function TimelineChart({ issues }: TimelineChartProps) {
  const data = useMemo(() => {
    // Group issues by week based on completion date
    const weeklyData: Record<
      string,
      { completed: number; inProgress: number; inReview: number }
    > = {};

    issues.forEach((issue) => {
      let date: Date | null = null;

      // Use completion date if available, otherwise use the latest timestamp
      if (issue.in_review_to_done_timestamp) {
        date = parseISO(issue.in_review_to_done_timestamp);
      } else if (issue.in_progress_to_in_review_timestamp) {
        date = parseISO(issue.in_progress_to_in_review_timestamp);
      } else if (issue.backlog_to_in_progress_timestamp) {
        date = parseISO(issue.backlog_to_in_progress_timestamp);
      }

      if (date) {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
        const weekKey = format(weekStart, "yyyy-MM-dd");

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { completed: 0, inProgress: 0, inReview: 0 };
        }

        if (issue.status === "Done") {
          weeklyData[weekKey].completed++;
        } else if (issue.status === "In Review") {
          weeklyData[weekKey].inReview++;
        } else if (issue.status === "In Progress") {
          weeklyData[weekKey].inProgress++;
        }
      }
    });

    // Convert to array and sort by date
    return Object.entries(weeklyData)
      .map(([date, counts]) => ({
        date: format(parseISO(date), "MMM dd"),
        "Completed": counts.completed,
        "In Review": counts.inReview,
        "In Progress": counts.inProgress,
      }))
      .sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-12); // Last 12 weeks
  }, [issues]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Issue Trends Over Time (by week)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Completed"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="In Review"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="In Progress"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


