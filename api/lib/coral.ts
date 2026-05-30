import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

const localCoralPath = path.join(process.cwd(), "bin", "coral");

// Set config directory for Coral to write in writable /tmp when running in Vercel
if (process.env.VERCEL) {
  process.env.CORAL_CONFIG_DIR = "/tmp/coral-config";
}

export interface CoralResult {
  columns: string[];
  rows: any[][];
}

/**
 * Checks if the Coral CLI is installed and available in the system PATH or bundled locally.
 */
export async function isCoralInstalled(): Promise<boolean> {
  if (fs.existsSync(localCoralPath)) {
    return true;
  }
  try {
    await execAsync("which coral");
    return true;
  } catch {
    return false;
  }
}

let onboarded = false;

/**
 * Dynamically registers sources (GitHub, Sentry, Datadog, PagerDuty, Slack) inside the Coral CLI configuration
 * using environment variables provided to the serverless runtime.
 */
async function onboardCoralSources(coralCmd: string): Promise<void> {
  if (onboarded) return;

  const configDir = process.env.CORAL_CONFIG_DIR || path.join(process.env.HOME || "", ".config", "coral");
  const configPath = path.join(configDir, "config.toml");

  if (fs.existsSync(configPath)) {
    onboarded = true;
    return;
  }

  console.log("[Coral Bridge] Running initial onboarding for Vercel/serverless...");
  const sources = ["github", "sentry", "datadog", "pagerduty", "slack"];

  for (const src of sources) {
    try {
      console.log(`[Coral Bridge] Onboarding source: ${src}`);
      await execAsync(`${coralCmd} source add ${src}`);
    } catch (e: any) {
      console.warn(`[Coral Bridge] Failed to onboard source ${src}:`, e.message);
    }
  }

  onboarded = true;
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

  const coralCmd = fs.existsSync(localCoralPath) ? localCoralPath : "coral";

  // Ensure sources are registered before executing the query
  await onboardCoralSources(coralCmd);

  try {
    // Escape double quotes and execute via CLI
    const escapedSql = sql.replace(/"/g, '\\"');
    const { stdout, stderr } = await execAsync(`${coralCmd} sql "${escapedSql}" --format json`);
    
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
