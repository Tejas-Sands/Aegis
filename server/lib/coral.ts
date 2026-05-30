import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

const localCoralPath = path.join(process.cwd(), "bin", "coral");

// Always set config directory for Coral to write to writable /tmp for serverless runtime compatibility
process.env.CORAL_CONFIG_DIR = "/tmp/coral-config";

const DATA_ROOT = "/tmp/coral-data";
const SOURCES_ROOT = "/tmp/coral-sources";

const YAML_TEMPLATES: Record<string, string> = {
  github: `
name: github
version: 0.1.0
dsl_version: 3
backend: file
tables:
  - name: commits
    description: GitHub Commits
    format: jsonl
    source:
      location: file:///tmp/coral-data/github/
      glob: "*.jsonl"
    columns:
      - name: hash
        type: Utf8
      - name: author
        type: Utf8
      - name: message
        type: Utf8
      - name: timestamp
        type: Utf8
`,
  sentry: `
name: sentry
version: 0.1.0
dsl_version: 3
backend: file
tables:
  - name: issues
    description: Sentry Exception Issues
    format: jsonl
    source:
      location: file:///tmp/coral-data/sentry/
      glob: "*.jsonl"
    columns:
      - name: error_type
        type: Utf8
      - name: count
        type: Int64
      - name: first_seen
        type: Utf8
      - name: level
        type: Utf8
`,
  datadog: `
name: datadog
version: 0.1.0
dsl_version: 3
backend: file
tables:
  - name: metrics
    description: Datadog Telemetry Metrics
    format: jsonl
    source:
      location: file:///tmp/coral-data/datadog/
      glob: "*.jsonl"
    columns:
      - name: metric_name
        type: Utf8
      - name: value
        type: Float64
      - name: host
        type: Utf8
      - name: timestamp
        type: Utf8
`,
  pagerduty: `
name: pagerduty
version: 0.1.0
dsl_version: 3
backend: file
tables:
  - name: incidents
    description: PagerDuty Incidents
    format: jsonl
    source:
      location: file:///tmp/coral-data/pagerduty/
      glob: "*.jsonl"
    columns:
      - name: id
        type: Int64
      - name: title
        type: Utf8
      - name: service
        type: Utf8
      - name: urgency
        type: Utf8
      - name: status
        type: Utf8
      - name: created_at
        type: Utf8
`,
  slack: `
name: slack
version: 0.1.0
dsl_version: 3
backend: file
tables:
  - name: messages
    description: Slack Messages
    format: jsonl
    source:
      location: file:///tmp/coral-data/slack/
      glob: "*.jsonl"
    columns:
      - name: user
        type: Utf8
      - name: text
        type: Utf8
      - name: channel
        type: Utf8
      - name: timestamp
        type: Utf8
`,
};

const JSONL_DATA: Record<string, string> = {
  github: `{"hash":"8bf9c2a","author":"johndoe","message":"fix: resolve memory leak in session handler","timestamp":"2026-05-29T18:12:00Z"}
{"hash":"2c7a10d","author":"johndoe","message":"feat: add oauth sign-in flow","timestamp":"2026-05-29T16:45:00Z"}
{"hash":"4a2b91c","author":"dev_agent","message":"chore: update environment configurations","timestamp":"2026-05-29T15:20:00Z"}`,
  sentry: `{"error_type":"NullPointerException","count":47,"first_seen":"2026-05-29T22:10:00Z","level":"error"}
{"error_type":"DatabaseTimeoutException","count":12,"first_seen":"2026-05-29T22:15:00Z","level":"fatal"}`,
  datadog: `{"metric_name":"cpu_usage","value":94.5,"host":"prod-web-01","timestamp":"2026-05-29T22:30:00Z"}
{"metric_name":"memory_utilization","value":81.2,"host":"prod-web-01","timestamp":"2026-05-29T22:30:00Z"}`,
  pagerduty: `{"id":1,"title":"Database connection spike","service":"payment-service","urgency":"high","status":"triggered","created_at":"2026-05-29T22:15:00Z"}
{"id":2,"title":"API Gateway 5xx threshold exceeded","service":"api-gateway","urgency":"high","status":"resolved","created_at":"2026-05-29T22:30:00Z"}`,
  slack: `{"user":"johndoe","text":"Is anyone else seeing memory utilization alerts?","channel":"sre-alerts","timestamp":"2026-05-29T22:20:00Z"}
{"user":"dev_agent","text":"Investigating the session handler fixes now.","channel":"sre-alerts","timestamp":"2026-05-29T22:22:00Z"}`
};

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
 * Dynamically registers sources (GitHub, Sentry, Datadog, PagerDuty, Slack) inside the Coral CLI configuration.
 * If API keys are present in environment variables, it registers the live source. Otherwise, it writes
 * mock files to /tmp/coral-data and registers local file-based sources.
 */
async function onboardCoralSources(coralCmd: string): Promise<void> {
  if (onboarded) return;

  const configDir = process.env.CORAL_CONFIG_DIR || path.join(process.env.HOME || "", ".config", "coral");
  const configPath = path.join(configDir, "config.toml");

  // If Coral has already written its configuration to /tmp/coral-config/config.toml, bypass re-onboarding
  if (fs.existsSync(configPath)) {
    onboarded = true;
    return;
  }

  console.log("[Coral Bridge] Running initial onboarding for Vercel/serverless...");

  // Ensure directories exist in /tmp
  if (!fs.existsSync(DATA_ROOT)) fs.mkdirSync(DATA_ROOT, { recursive: true });
  if (!fs.existsSync(SOURCES_ROOT)) fs.mkdirSync(SOURCES_ROOT, { recursive: true });

  const integrations = [
    { name: "github", envKey: "GITHUB_TOKEN", tableName: "commits" },
    { name: "sentry", envKey: "SENTRY_TOKEN", tableName: "issues" },
    { name: "datadog", envKey: "DATADOG_API_KEY", tableName: "metrics" },
    { name: "pagerduty", envKey: "PAGERDUTY_TOKEN", tableName: "incidents" },
    { name: "slack", envKey: "SLACK_TOKEN", tableName: "messages" }
  ];

  for (const integration of integrations) {
    const hasKey = process.env[integration.envKey] && process.env[integration.envKey].trim() !== "";
    
    try {
      if (hasKey) {
        console.log(`[Coral Bridge] Key found for ${integration.name}. Onboarding live API source...`);
        await execAsync(`${coralCmd} source add ${integration.name}`);
      } else {
        console.log(`[Coral Bridge] No key found for ${integration.name}. Registering local file fallback...`);

        // Write the data folder and JSONL file
        const dataDir = path.join(DATA_ROOT, integration.name);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        const dataPath = path.join(dataDir, `${integration.tableName}.jsonl`);
        fs.writeFileSync(dataPath, JSONL_DATA[integration.name]);

        // Write the source YAML spec file
        const specPath = path.join(SOURCES_ROOT, `${integration.name}.yaml`);
        fs.writeFileSync(specPath, YAML_TEMPLATES[integration.name].trim());

        // Add the file source spec to Coral configuration
        await execAsync(`${coralCmd} source add --file ${specPath}`);
      }
    } catch (e: any) {
      console.warn(`[Coral Bridge] Failed to onboard source ${integration.name}:`, e.message);
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
