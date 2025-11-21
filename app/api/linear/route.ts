import { NextRequest, NextResponse } from "next/server";
import { getAllLinearIssues, processLinearIssues, getAllCycles, getAllWorkflowStates } from "@/app/lib/linear";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LINEAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "LINEAR_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    // Fetch all issues, cycles, and workflow states from Linear in parallel
    const [issues, cycles, workflowStates] = await Promise.all([
      getAllLinearIssues(apiKey),
      getAllCycles(apiKey).catch((err) => {
        console.error("Error fetching cycles:", err);
        return [] as string[];
      }),
      getAllWorkflowStates(apiKey).catch((err) => {
        console.error("Error fetching workflow states:", err);
        return [] as string[];
      }),
    ]);

    // Debug: Log cycle data
    const issuesWithCycles = issues.filter((issue) => issue.cycle !== null);
    console.log(`Total issues: ${issues.length}`);
    console.log(`Issues with cycles: ${issuesWithCycles.length}`);
    if (issuesWithCycles.length > 0) {
      console.log("Sample cycle data:", issuesWithCycles[0].cycle);
    }
    console.log(`Total cycles fetched: ${cycles.length}`);

    // Process issues to calculate durations and derive status
    const processedIssues = processLinearIssues(issues);

    // Extract cycles from issues and combine with fetched cycles
    const cyclesFromIssues = new Set(
      processedIssues
        .map((issue) => issue.sprint)
        .filter((cycle): cycle is string => cycle !== null)
    );
    const allCycles = Array.from(new Set([...cycles, ...cyclesFromIssues])).sort();

    // Debug: Log processed cycle data
    const processedWithCycles = processedIssues.filter((issue) => issue.sprint !== null);
    console.log(`Processed issues with cycles: ${processedWithCycles.length}`);
    console.log(`All available cycles: ${allCycles.length}`, allCycles);

    return NextResponse.json({
      issues: processedIssues,
      availableCycles: allCycles,
      availableStatuses: workflowStates,
    });
  } catch (error) {
    console.error("Error fetching Linear issues:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch issues" },
      { status: 500 }
    );
  }
}


