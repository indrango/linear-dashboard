"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ProcessedIssue } from "@/app/lib/types";

interface DurationChartProps {
  issues: ProcessedIssue[];
}

export default function DurationChart({ issues }: DurationChartProps) {
  const data = useMemo(() => {
    const assigneeData: Record<
      string,
      { 
        inProgressToReview: number[];
        inReviewToReadyToQa: number[];
        readyToQaToDone: number[];
      }
    > = {};

    issues.forEach((issue) => {
      if (!assigneeData[issue.assignee]) {
        assigneeData[issue.assignee] = {
          inProgressToReview: [],
          inReviewToReadyToQa: [],
          readyToQaToDone: [],
        };
      }

      if (issue.in_progress_to_in_review_days !== null) {
        assigneeData[issue.assignee].inProgressToReview.push(
          issue.in_progress_to_in_review_days
        );
      }

      if (issue.in_review_to_ready_to_qa_days !== null) {
        assigneeData[issue.assignee].inReviewToReadyToQa.push(
          issue.in_review_to_ready_to_qa_days
        );
      }

      if (issue.ready_to_qa_to_done_days !== null) {
        assigneeData[issue.assignee].readyToQaToDone.push(
          issue.ready_to_qa_to_done_days
        );
      }
    });

    return Object.entries(assigneeData)
      .map(([assignee, data]) => {
        const avgInProgressToReview =
          data.inProgressToReview.length > 0
            ? data.inProgressToReview.reduce((a, b) => a + b, 0) /
              data.inProgressToReview.length
            : 0;

        const avgInReviewToReadyToQa =
          data.inReviewToReadyToQa.length > 0
            ? data.inReviewToReadyToQa.reduce((a, b) => a + b, 0) /
              data.inReviewToReadyToQa.length
            : 0;

        const avgReadyToQaToDone =
          data.readyToQaToDone.length > 0
            ? data.readyToQaToDone.reduce((a, b) => a + b, 0) /
              data.readyToQaToDone.length
            : 0;

        return {
          assignee: assignee.length > 15 ? assignee.substring(0, 15) + "..." : assignee,
          "In Progress → Review": Math.round(avgInProgressToReview * 100) / 100,
          "Review → Ready to QA": Math.round(avgInReviewToReadyToQa * 100) / 100,
          "Ready to QA → Done": Math.round(avgReadyToQaToDone * 100) / 100,
        };
      })
      .filter((d) => d["In Progress → Review"] > 0 || d["Review → Ready to QA"] > 0 || d["Ready to QA → Done"] > 0)
      .sort((a, b) => {
        const aTotal = a["In Progress → Review"] + a["Review → Ready to QA"] + a["Ready to QA → Done"];
        const bTotal = b["In Progress → Review"] + b["Review → Ready to QA"] + b["Ready to QA → Done"];
        return bTotal - aTotal;
      })
      .slice(0, 10); // Top 10 assignees
  }, [issues]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Average Duration by Assignee (days)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="assignee"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="In Progress → Review"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="Review → Ready to QA" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="Ready to QA → Done" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


