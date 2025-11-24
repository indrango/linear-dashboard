"use client";

import { useState, useMemo } from "react";
import { ProcessedIssue } from "@/app/lib/types";
import { formatDate, formatDateTime, cn } from "@/app/lib/utils";

interface LabelOption {
  name: string;
  color: string;
}

interface IssueTableProps {
  issues: ProcessedIssue[];
  availableLabels?: LabelOption[];
}

type SortField =
  | "issue_number"
  | "issue_title"
  | "assignee"
  | "status"
  | "labels"
  | "in_progress_to_in_review_days"
  | "in_review_to_ready_to_qa_days"
  | "ready_to_qa_to_done_days"
  | "estimate_points";
type SortDirection = "asc" | "desc";

export default function IssueTable({ issues, availableLabels = [] }: IssueTableProps) {
  const [sortField, setSortField] = useState<SortField>("issue_number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedIssues = useMemo(() => {
    const sorted = [...issues].sort((a, b) => {
      let aValue: string | number | null;
      let bValue: string | number | null;

      switch (sortField) {
        case "issue_number":
          aValue = a.issue_number;
          bValue = b.issue_number;
          break;
        case "issue_title":
          aValue = a.issue_title.toLowerCase();
          bValue = b.issue_title.toLowerCase();
          break;
        case "assignee":
          aValue = a.assignee.toLowerCase();
          bValue = b.assignee.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "in_progress_to_in_review_days":
          aValue = a.in_progress_to_in_review_days ?? -1;
          bValue = b.in_progress_to_in_review_days ?? -1;
          break;
        case "in_review_to_ready_to_qa_days":
          aValue = a.in_review_to_ready_to_qa_days ?? -1;
          bValue = b.in_review_to_ready_to_qa_days ?? -1;
          break;
        case "ready_to_qa_to_done_days":
          aValue = a.ready_to_qa_to_done_days ?? -1;
          bValue = b.ready_to_qa_to_done_days ?? -1;
          break;
        case "estimate_points":
          aValue = a.estimate_points ?? -1;
          bValue = b.estimate_points ?? -1;
          break;
        case "labels":
          // Sort by number of labels first, then alphabetically by first label name
          const aLabelCount = a.labels?.length ?? 0;
          const bLabelCount = b.labels?.length ?? 0;
          if (aLabelCount !== bLabelCount) {
            return sortDirection === "asc" 
              ? aLabelCount - bLabelCount 
              : bLabelCount - aLabelCount;
          }
          const aFirstLabel = a.labels?.[0]?.toLowerCase() ?? "";
          const bFirstLabel = b.labels?.[0]?.toLowerCase() ?? "";
          aValue = aFirstLabel;
          bValue = bFirstLabel;
          break;
        default:
          return 0;
      }

      if (aValue === null || aValue === -1) return 1;
      if (bValue === null || bValue === -1) return -1;

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [issues, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Helper function to get contrast color (black or white) based on background
  const getContrastColor = (hexColor: string): string => {
    // Remove # if present
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In QA":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Ready to QA":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Todo":
      case "Backlog":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Canceled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Duplicate":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <span className="text-gray-400 text-xs ml-1">
          <svg
            className="w-4 h-4 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </span>
      );
    }
    return (
      <span className="text-blue-600 text-xs ml-1">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("issue_number")}
            >
              <div className="flex items-center">
                #
                <SortIcon field="issue_number" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("issue_title")}
            >
              <div className="flex items-center">
                Title
                <SortIcon field="issue_title" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("assignee")}
            >
              <div className="flex items-center">
                Assignee
                <SortIcon field="assignee" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status
                <SortIcon field="status" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("labels")}
            >
              <div className="flex items-center">
                Labels
                <SortIcon field="labels" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              QA Iterations
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Avg Time to Fix QA
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("estimate_points")}
            >
              <div className="flex items-center">
                Estimate
                <SortIcon field="estimate_points" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("in_progress_to_in_review_days")}
            >
              <div className="flex items-center">
                In Progress → Review (days)
                <SortIcon field="in_progress_to_in_review_days" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("in_review_to_ready_to_qa_days")}
            >
              <div className="flex items-center">
                Review → Ready to QA (days)
                <SortIcon field="in_review_to_ready_to_qa_days" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("ready_to_qa_to_done_days")}
            >
              <div className="flex items-center">
                Ready to QA → Done (days)
                <SortIcon field="ready_to_qa_to_done_days" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Started
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Completed
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedIssues.map((issue) => (
            <tr
              key={issue.issue_id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {issue.issue_number}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">
                {issue.issue_title}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.assignee}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    getStatusColor(issue.status)
                  )}
                >
                  {issue.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                {issue.labels && issue.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map((labelName) => {
                      const label = availableLabels.find((l) => l.name === labelName);
                      return (
                        <span
                          key={labelName}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: label?.color || "#6B7280",
                            color: label ? getContrastColor(label.color) : "#FFFFFF",
                          }}
                        >
                          {labelName}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                {issue.qa_feedback_iterations > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                    {issue.qa_feedback_iterations}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {(() => {
                  const cycles = issue.qa_feedback_cycles || [];
                  if (cycles.length === 0) return <span className="text-gray-400">-</span>;
                  
                  const timesToFix = cycles.map(cycle => {
                    // Time to fix = from when status changed (work started) to when back to Ready to QA
                    const start = new Date(cycle.status_change_timestamp);
                    const end = new Date(cycle.to_ready_to_qa_timestamp);
                    const diffMs = end.getTime() - start.getTime();
                    return diffMs / (1000 * 60 * 60 * 24);
                  });
                  
                  const avgTime = timesToFix.reduce((a, b) => a + b, 0) / timesToFix.length;
                  return `${Math.round(avgTime * 100) / 100} days`;
                })()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.estimate_points ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.in_progress_to_in_review_days ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.in_review_to_ready_to_qa_days ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.ready_to_qa_to_done_days ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(issue.backlog_to_in_progress_timestamp)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(issue.ready_to_qa_to_done_timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedIssues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No issues found matching the current filters.
        </div>
      )}
    </div>
  );
}


