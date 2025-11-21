"use client";

import { useMemo } from "react";
import { ProcessedIssue } from "@/app/lib/types";

interface KPICardsProps {
  issues: ProcessedIssue[];
}

export default function KPICards({ issues }: KPICardsProps) {
  const metrics = useMemo(() => {
    const totalIssues = issues.length;
    const doneIssues = issues.filter((i) => i.status_type === "completed").length;
    const completionRate = totalIssues > 0 ? (doneIssues / totalIssues) * 100 : 0;

    const inProgressToReviewDays = issues
      .map((i) => i.in_progress_to_in_review_days)
      .filter((d): d is number => d !== null);
    const avgInProgressToReview =
      inProgressToReviewDays.length > 0
        ? inProgressToReviewDays.reduce((a, b) => a + b, 0) /
        inProgressToReviewDays.length
        : 0;

    const inReviewToDoneDays = issues
      .map((i) => i.in_review_to_done_days)
      .filter((d): d is number => d !== null);
    const avgInReviewToDone =
      inReviewToDoneDays.length > 0
        ? inReviewToDoneDays.reduce((a, b) => a + b, 0) /
        inReviewToDoneDays.length
        : 0;

    return {
      totalIssues,
      completionRate: Math.round(completionRate * 10) / 10,
      avgInProgressToReview: Math.round(avgInProgressToReview * 100) / 100,
      avgInReviewToDone: Math.round(avgInReviewToDone * 100) / 100,
    };
  }, [issues]);

  const Card = ({
    title,
    value,
    subtitle,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Total Issues" value={metrics.totalIssues} />
      <Card
        title="Completion Rate"
        value={`${metrics.completionRate}%`}
        subtitle={`${issues.filter((i) => i.status_type === "completed").length} completed`}
      />
      <Card
        title="Avg: In Progress → Review"
        value={`${metrics.avgInProgressToReview} days`}
        subtitle="Average duration"
      />
      <Card
        title="Avg: Review → Done"
        value={`${metrics.avgInReviewToDone} days`}
        subtitle="Average duration"
      />
    </div>
  );
}


