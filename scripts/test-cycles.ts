import { getAllCycles } from "../app/lib/linear";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function testCycles() {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    console.error("❌ ERROR: LINEAR_API_KEY environment variable is not set");
    console.log("Please set LINEAR_API_KEY in your .env.local file");
    process.exit(1);
  }

  console.log("🔍 Fetching cycles from Linear API...\n");

  try {
    const cycles = await getAllCycles(apiKey);

    console.log(`✅ Successfully fetched ${cycles.length} cycle(s)\n`);

    if (cycles.length === 0) {
      console.log("⚠️  No cycles found. This could mean:");
      console.log("   - No cycles exist in your Linear workspace");
      console.log("   - All cycles ended more than 6 months ago");
      console.log("   - Cycles are filtered out by date range\n");
    } else {
      console.log("📋 List of cycles:");
      console.log("─".repeat(50));
      cycles.forEach((cycle, index) => {
        console.log(`${index + 1}. ${cycle}`);
      });
      console.log("─".repeat(50));
    }
  } catch (error) {
    console.error("❌ Error fetching cycles:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testCycles();

