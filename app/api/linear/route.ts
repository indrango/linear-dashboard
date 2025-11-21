import { NextRequest, NextResponse } from "next/server";
import { getAllLinearIssues, processLinearIssues } from "@/app/lib/linear";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LINEAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "LINEAR_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    // Fetch all issues from Linear
    const issues = await getAllLinearIssues(apiKey);

    // Process issues to calculate durations and derive status
    const processedIssues = processLinearIssues(issues);

    return NextResponse.json(processedIssues);
  } catch (error) {
    console.error("Error fetching Linear issues:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch issues" },
      { status: 500 }
    );
  }
}


