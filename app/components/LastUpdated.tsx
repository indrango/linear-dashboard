"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { formatDateTime } from "@/app/lib/utils";

interface LastUpdatedProps {
  lastUpdated: number | undefined;
  isStale?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
}

export default function LastUpdated({
  lastUpdated,
  isStale = false,
  isRefetching = false,
  onRefresh,
}: LastUpdatedProps) {
  const [now, setNow] = useState(() => Date.now());

  // Update relative time every minute
  useEffect(() => {
    if (!lastUpdated) return;

    // Update immediately when lastUpdated changes
    setNow(Date.now());

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!lastUpdated) {
    return null;
  }

  const lastUpdatedDate = new Date(lastUpdated);
  const relativeTime = formatDistanceToNow(lastUpdatedDate, { addSuffix: true });
  const absoluteTime = formatDateTime(lastUpdatedDate.toISOString());

  // Determine freshness status
  const minutesSinceUpdate = (now - lastUpdated) / (1000 * 60);
  const isFresh = minutesSinceUpdate < 5; // Fresh if less than 5 minutes
  const isVeryStale = minutesSinceUpdate > 30; // Very stale if more than 30 minutes

  // Status indicator color
  let statusColor = "text-green-600";
  let statusBgColor = "bg-green-100";
  let dotColor = "bg-green-500";
  let statusText = "Fresh";
  
  if (isVeryStale) {
    statusColor = "text-red-600";
    statusBgColor = "bg-red-100";
    dotColor = "bg-red-500";
    statusText = "Stale";
  } else if (!isFresh) {
    statusColor = "text-yellow-600";
    statusBgColor = "bg-yellow-100";
    dotColor = "bg-yellow-500";
    statusText = "Moderate";
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${dotColor} ${
            isRefetching ? "animate-pulse" : ""
          }`}
          title={absoluteTime}
        />
        <span className="text-gray-600">
          Last updated:{" "}
          <span className="font-medium" title={absoluteTime}>
            {relativeTime}
          </span>
        </span>
        {isStale && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${statusColor} ${statusBgColor}`}
          >
            {statusText}
          </span>
        )}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefetching}
          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          title="Refresh data"
          aria-label="Refresh data"
          type="button"
        >
          {isRefetching ? "Refreshing..." : "Refresh"}
        </button>
      )}
    </div>
  );
}

