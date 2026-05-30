import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface CoralResult {
  columns: string[];
  rows: any[][];
}

/**
 * Checks if the Coral CLI is installed and available in the system PATH.
 */
export async function isCoralInstalled(): Promise<boolean> {
  try {
    await execAsync("which coral");
    return true;
  } catch {
    return false;
  }
}

/**
 * Executes a SQL query against the local Coral CLI query runtime.
 * Falls back to mock data if the CLI is not available.
 */
export async function executeCoralQuery(sql: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
  isMock: boolean;
}> {
  const installed = await isCoralInstalled();

  if (!installed) {
    // If Coral is not installed, return simulated data matching the query request
    console.warn("[Coral Bridge] CLI not found. Running in simulated mode.");
    return {
      success: true,
      isMock: true,
      data: getMockCoralData(sql),
    };
  }

  try {
    // Escape double quotes and execute via CLI
    const escapedSql = sql.replace(/"/g, '\\"');
    const { stdout, stderr } = await execAsync(`coral sql "${escapedSql}" --format json`);
    
    if (stderr && !stdout) {
      return { success: false, error: stderr, isMock: false };
    }

    const parsed = JSON.parse(stdout);
    return {
      success: true,
      data: Array.isArray(parsed) ? parsed : [parsed],
      isMock: false,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to execute query on Coral CLI",
      isMock: false,
    };
  }
}

/**
 * Fallback mock generator that returns realistic table rows depending on the generated query.
 */
function getMockCoralData(sql: string): any[] {
  const query = sql.toLowerCase();
  
  if (query.includes("github.commits") || query.includes("commits")) {
    return [
      { hash: "8bf9c2a", author: "johndoe", message: "fix: resolve memory leak in session handler", timestamp: "2026-05-29T18:12:00Z" },
      { hash: "2c7a10d", author: "johndoe", message: "feat: add oauth sign-in flow", timestamp: "2026-05-29T16:45:00Z" },
      { hash: "4a2b91c", author: "dev_agent", message: "chore: update environment configurations", timestamp: "2026-05-29T15:20:00Z" }
    ];
  }
  
  if (query.includes("sentry.issues") || query.includes("errors") || query.includes("issues")) {
    return [
      { error_type: "NullPointerException", count: 47, first_seen: "2026-05-29T22:10:00Z", level: "error" },
      { error_type: "DatabaseTimeoutException", count: 12, first_seen: "2026-05-29T22:15:00Z", level: "fatal" }
    ];
  }
  
  if (query.includes("datadog.metrics") || query.includes("metrics")) {
    return [
      { metric_name: "cpu_usage", value: 94.5, host: "prod-web-01", timestamp: "2026-05-29T22:30:00Z" },
      { metric_name: "memory_utilization", value: 81.2, host: "prod-web-01", timestamp: "2026-05-29T22:30:00Z" }
    ];
  }
  
  // Default fallback records
  return [
    { id: 1, title: "Database connection spike", service: "payment-service", urgency: "high", status: "triggered" },
    { id: 2, title: "API Gateway 5xx threshold exceeded", service: "api-gateway", urgency: "high", status: "resolved" }
  ];
}
