"use client";

import { useState, useMemo } from "react";
import { ProcessedIssue } from "@/app/lib/types";
import { formatDate, formatDateTime, cn } from "@/app/lib/utils";

interface IssueTableProps {
  issues: ProcessedIssue[];
}

type SortField =
  | "issue_number"
  | "issue_title"
  | "assignee"
  | "status"
  | "in_progress_to_in_review_days"
  | "in_review_to_done_days"
  | "estimate_points";
type SortDirection = "asc" | "desc";

export default function IssueTable({ issues }: IssueTableProps) {
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
        case "in_review_to_done_days":
          aValue = a.in_review_to_done_days ?? -1;
          bValue = b.in_review_to_done_days ?? -1;
          break;
        case "estimate_points":
          aValue = a.estimate_points ?? -1;
          bValue = b.estimate_points ?? -1;
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
              onClick={() => handleSort("in_review_to_done_days")}
            >
              <div className="flex items-center">
                Review → Done (days)
                <SortIcon field="in_review_to_done_days" />
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
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.estimate_points ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.in_progress_to_in_review_days ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {issue.in_review_to_done_days ?? "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(issue.backlog_to_in_progress_timestamp)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(issue.in_review_to_done_timestamp)}
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


