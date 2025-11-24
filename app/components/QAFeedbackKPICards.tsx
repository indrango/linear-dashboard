"use client";

import { useMemo } from "react";
import { ProcessedIssue } from "@/app/lib/types";
import { KPICard } from "./KPICard";

interface QAFeedbackKPICardsProps {
  issues: ProcessedIssue[];
}

export default function QAFeedbackKPICards({ issues }: QAFeedbackKPICardsProps) {
  const metrics = useMemo(() => {
    // QA Feedback metrics
    const qaFeedbackIssues = issues.filter(issue => 
      issue.labels.some(label => 
        label.toLowerCase().includes("qa feedback") || 
        label.toLowerCase() === "qa feedback"
      )
    );
    const totalQaFeedbackIterations = qaFeedbackIssues.reduce(
      (sum, issue) => sum + (issue.qa_feedback_iterations || 0),
      0
    );
    const issuesWithIterations = qaFeedbackIssues.filter(
      issue => (issue.qa_feedback_iterations || 0) > 0
    );
    const avgIterations = issuesWithIterations.length > 0
      ? (totalQaFeedbackIterations / issuesWithIterations.length)
      : 0;

    // Calculate average time to fix QA feedback
    const allTimesToFix: number[] = [];
    qaFeedbackIssues.forEach(issue => {
      const cycles = issue.qa_feedback_cycles || [];
      cycles.forEach(cycle => {
        // Time to fix = from when status changed (work started) to when back to Ready to QA
        const start = new Date(cycle.status_change_timestamp);
        const end = new Date(cycle.to_ready_to_qa_timestamp);
        const diffMs = end.getTime() - start.getTime();
        const days = diffMs / (1000 * 60 * 60 * 24);
        allTimesToFix.push(days);
      });
    });
    const avgTimeToFixQaFeedback = allTimesToFix.length > 0
      ? allTimesToFix.reduce((a, b) => a + b, 0) / allTimesToFix.length
      : 0;

    // Calculate total time to fix (sum of all iterations)
    const totalTimeToFix = allTimesToFix.reduce((a, b) => a + b, 0);

    // Issues currently in "In QA" with QA Feedback label
    const inQaWithFeedback = qaFeedbackIssues.filter(
      issue => issue.status === "In QA"
    ).length;

    return {
      qaFeedbackIssuesCount: qaFeedbackIssues.length,
      totalQaFeedbackIterations,
      avgIterations: Math.round(avgIterations * 10) / 10,
      avgTimeToFixQaFeedback: Math.round(avgTimeToFixQaFeedback * 100) / 100,
      totalTimeToFix: Math.round(totalTimeToFix * 100) / 100,
      inQaWithFeedback,
    };
  }, [issues]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        title="QA Feedback Issues"
        value={metrics.qaFeedbackIssuesCount}
        subtitle="Issues with QA Feedback label"
      />
      <KPICard
        title="Total QA Iterations"
        value={metrics.totalQaFeedbackIterations}
        subtitle="Total feedback cycles"
      />
      <KPICard
        title="Avg QA Iterations"
        value={metrics.avgIterations > 0 ? metrics.avgIterations.toFixed(1) : "0"}
        subtitle="Per issue with feedback"
      />
      <KPICard
        title="Avg Time to Fix QA"
        value={metrics.avgTimeToFixQaFeedback > 0 ? `${metrics.avgTimeToFixQaFeedback} days` : "N/A"}
        subtitle="Average fix time"
      />
      <KPICard
        title="In QA with Feedback"
        value={metrics.inQaWithFeedback}
        subtitle="Currently in QA"
      />
    </div>
  );
}

