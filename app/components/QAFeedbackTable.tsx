"use client";

import { ProcessedIssue } from "@/app/lib/types";
import { formatDate } from "@/app/lib/utils";

interface QAFeedbackTableProps {
  issues: ProcessedIssue[];
  availableLabels: Array<{ name: string; color: string }>;
}

export default function QAFeedbackTable({ issues, availableLabels }: QAFeedbackTableProps) {
  // Filter issues with QA Feedback label
  const qaFeedbackIssues = issues.filter(issue => 
    issue.labels.some(label => 
      label.toLowerCase().includes("qa feedback") || 
      label.toLowerCase() === "qa feedback"
    )
  );

  // Calculate time to fix for each iteration
  const getTimeToFix = (cycle: {
    qa_feedback_timestamp: string;
    status_change_timestamp: string;
    to_ready_to_qa_timestamp: string;
  }) => {
    // Time to fix = from when status changed (work started) to when back to Ready to QA
    const start = new Date(cycle.status_change_timestamp);
    const end = new Date(cycle.to_ready_to_qa_timestamp);
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            QA Feedback Analysis
          </h3>
          <div className="text-sm text-gray-600">
            {qaFeedbackIssues.length} issue{qaFeedbackIssues.length !== 1 ? 's' : ''} with QA Feedback
          </div>
        </div>
      </div>

      {qaFeedbackIssues.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          No issues with QA Feedback label found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Iterations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Avg Time to Fix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total Time to Fix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Iteration Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qaFeedbackIssues.map((issue) => {
                const cycles = issue.qa_feedback_cycles || [];
                const timesToFix = cycles.map(getTimeToFix);
                const avgTimeToFix = timesToFix.length > 0
                  ? (timesToFix.reduce((a, b) => a + b, 0) / timesToFix.length).toFixed(1)
                  : "N/A";
                const totalTimeToFix = timesToFix.reduce((a, b) => a + b, 0).toFixed(1);

                return (
                  <tr key={issue.issue_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {issue.issue_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      {issue.issue_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {issue.assignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                        {issue.qa_feedback_iterations || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {avgTimeToFix !== "N/A" ? `${avgTimeToFix} days` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {totalTimeToFix !== "0.0" ? `${totalTimeToFix} days` : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {cycles.length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">
                            View {cycles.length} iteration{cycles.length !== 1 ? 's' : ''}
                          </summary>
                          <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                            {cycles.map((cycle, idx) => {
                              const timeToFix = getTimeToFix(cycle);
                              return (
                                <div key={idx} className="text-xs">
                                  <div className="font-medium text-gray-900">
                                    Iteration {idx + 1}
                                  </div>
                                  <div className="text-gray-600 mt-1">
                                    <div>QA Feedback Given: {formatDate(cycle.qa_feedback_timestamp)}</div>
                                    <div>Status Changed: {formatDate(cycle.status_change_timestamp)}</div>
                                    <div>Back to Ready to QA: {formatDate(cycle.to_ready_to_qa_timestamp)}</div>
                                    <div className="font-semibold text-orange-600 mt-1">
                                      Time to Fix: {timeToFix} days
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      ) : (
                        <span className="text-gray-400">No iterations</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

