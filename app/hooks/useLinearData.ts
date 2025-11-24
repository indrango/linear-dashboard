"use client";

import { useQuery } from "@tanstack/react-query";
import { ProcessedIssue } from "@/app/lib/types";

interface LinearDataResponse {
  issues: ProcessedIssue[];
  availableCycles: string[];
  availableStatuses: string[];
  availableLabels: Array<{ name: string; color: string }>;
}

async function fetchLinearData(): Promise<LinearDataResponse> {
  const response = await fetch("/api/linear");
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Failed to fetch: ${response.status} ${errorText}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (jsonError) {
    throw new Error("Failed to parse response: Invalid JSON");
  }

  // Handle both old format (array) and new format (object)
  if (Array.isArray(data)) {
    // Backward compatibility: old format
    const cycles = new Set(
      data.map((i) => i.sprint).filter((s): s is string => s !== null)
    );
    const labels = new Set(data.flatMap((i) => i.labels || []));

    return {
      issues: data,
      availableCycles: Array.from(cycles).sort(),
      availableStatuses: ["Todo", "In Progress", "In Review", "Done"],
      availableLabels: Array.from(labels)
        .map((name) => ({ name, color: "#6B7280" }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  // Validate new format structure
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid response format: Expected object or array");
  }

  const responseData = data as {
    issues?: ProcessedIssue[];
    availableCycles?: string[];
    availableStatuses?: string[];
    availableLabels?: Array<{ name: string; color: string } | string>;
    error?: string;
  };

  // Check for API error response
  if (responseData.error) {
    throw new Error(responseData.error);
  }

  // New format: object with issues, availableCycles, availableStatuses, and availableLabels
  return {
    issues: responseData.issues || [],
    availableCycles: responseData.availableCycles || [],
    availableStatuses: responseData.availableStatuses || [],
    availableLabels:
      responseData.availableLabels?.map((label: { name: string; color: string } | string) =>
        typeof label === "string" ? { name: label, color: "#6B7280" } : label
      ) || [],
  };
}

export function useLinearData() {
  const query = useQuery<LinearDataResponse, Error>({
    queryKey: ["linearData"],
    queryFn: fetchLinearData,
  });

  return {
    ...query,
    // Expose additional metadata for status indicator
    lastUpdated: query.dataUpdatedAt,
    isStale: query.isStale,
  };
}

