import { NextRequest, NextResponse } from "next/server";
import { getAllLinearIssues, processLinearIssues, getAllCycles, getAllWorkflowStates, getAllLabels } from "@/app/lib/linear";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LINEAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "LINEAR_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    // Fetch all issues, cycles, workflow states, and labels from Linear in parallel
    const [issues, cycles, workflowStates, labels] = await Promise.all([
      getAllLinearIssues(apiKey),
      getAllCycles(apiKey).catch((err) => {
        console.error("Error fetching cycles:", err);
        return [] as string[];
      }),
      getAllWorkflowStates(apiKey).catch((err) => {
        console.error("Error fetching workflow states:", err);
        return [] as string[];
      }),
      getAllLabels(apiKey).catch((err) => {
        console.error("Error fetching labels:", err);
        return [] as Array<{ name: string; color: string }>;
      }),
    ]);

    // Process issues to calculate durations and derive status
    const processedIssues = processLinearIssues(issues);

    // Extract cycles from issues and combine with fetched cycles
    const cyclesFromIssues = new Set(
      processedIssues
        .map((issue) => issue.sprint)
        .filter((cycle): cycle is string => cycle !== null)
    );
    const allCycles = Array.from(new Set([...cycles, ...cyclesFromIssues])).sort();

    // Extract labels from issues and combine with fetched labels
    const labelsFromIssues = new Set(
      processedIssues.flatMap((issue) => issue.labels)
    );
    
    // Create a map of label names to colors from fetched labels
    const labelMap = new Map(labels.map((label) => [label.name, label.color]));
    
    // Combine labels, using colors from fetched labels when available
    const allLabels = Array.from(
      new Set([...labels.map((l) => l.name), ...labelsFromIssues])
    )
      .map((name) => ({
        name,
        color: labelMap.get(name) || "#6B7280", // Default gray if color not found
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      issues: processedIssues,
      availableCycles: allCycles,
      availableStatuses: workflowStates,
      availableLabels: allLabels,
    });
  } catch (error) {
    console.error("Error fetching Linear issues:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch issues" },
      { status: 500 }
    );
  }
}


