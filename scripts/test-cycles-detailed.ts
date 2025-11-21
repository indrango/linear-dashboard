import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const LINEAR_API_URL = "https://api.linear.app/graphql";

async function testCyclesDetailed() {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    console.error("❌ ERROR: LINEAR_API_KEY environment variable is not set");
    process.exit(1);
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateFilter = sixMonthsAgo.toISOString();

  console.log("🔍 Testing Linear Cycles API...\n");
  console.log(`📅 Date filter: ${dateFilter} (6 months ago)\n`);

  // Test 1: Query cycles with date filter
  const query1 = `
    query Cycles {
      cycles(
        first: 100
        filter: {
          endsAt: { gte: "${dateFilter}" }
        }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          startsAt
          endsAt
          number
          team {
            id
            name
          }
        }
      }
    }
  `;

  try {
    console.log("📤 Sending query 1: Cycles with date filter...");
    const response1 = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query1 }),
    });

    const data1 = await response1.json();
    
    if (data1.errors) {
      console.error("❌ GraphQL Errors:");
      console.error(JSON.stringify(data1.errors, null, 2));
    }

    if (data1.data?.cycles) {
      const cycles = data1.data.cycles.nodes;
      console.log(`✅ Found ${cycles.length} cycle(s)\n`);
      
      if (cycles.length > 0) {
        console.log("📋 Cycle Details:");
        console.log("=".repeat(80));
        cycles.forEach((cycle: any, index: number) => {
          console.log(`\n${index + 1}. ${cycle.name}`);
          console.log(`   ID: ${cycle.id}`);
          console.log(`   Number: ${cycle.number}`);
          console.log(`   Starts: ${cycle.startsAt || "N/A"}`);
          console.log(`   Ends: ${cycle.endsAt || "N/A"}`);
          if (cycle.team) {
            console.log(`   Team: ${cycle.team.name} (${cycle.team.id})`);
          }
        });
        console.log("\n" + "=".repeat(80));
      }
    }

    // Test 2: Query all cycles (no filter)
    console.log("\n\n📤 Sending query 2: All cycles (no date filter)...");
    const query2 = `
      query AllCycles {
        cycles(first: 10) {
          nodes {
            id
            name
            startsAt
            endsAt
            number
          }
        }
      }
    `;

    const response2 = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query2 }),
    });

    const data2 = await response2.json();
    
    if (data2.errors) {
      console.error("❌ GraphQL Errors:");
      console.error(JSON.stringify(data2.errors, null, 2));
    }

    if (data2.data?.cycles) {
      const allCycles = data2.data.cycles.nodes;
      console.log(`✅ Found ${allCycles.length} total cycle(s) (first 10)\n`);
      
      if (allCycles.length > 0) {
        console.log("📋 All Cycles (sample):");
        allCycles.forEach((cycle: any, index: number) => {
          console.log(`   ${index + 1}. ${cycle.name} (${cycle.startsAt} - ${cycle.endsAt})`);
        });
      }
    }

  } catch (error) {
    console.error("❌ Error:");
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }
  }
}

testCyclesDetailed();

