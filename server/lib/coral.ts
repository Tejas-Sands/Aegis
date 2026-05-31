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
      - name: repository
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
      - name: service
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
      - name: service
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
  github: [
    '{"hash":"a3f8c1d","author":"jordan.kim","message":"refactor: migrate Stripe webhook handler to async pipeline","timestamp":"2026-05-31T04:22:00Z","repository":"payments-api"}',
    '{"hash":"7b2e9f4","author":"jordan.kim","message":"fix: add retry logic for idempotent payment captures","timestamp":"2026-05-31T04:18:00Z","repository":"payments-api"}',
    '{"hash":"e5d1a08","author":"casey.patel","message":"chore: bump stripe-node from 14.x to 15.x","timestamp":"2026-05-31T04:05:00Z","repository":"payments-api"}',
    '{"hash":"1c9b3e7","author":"jordan.kim","message":"feat: add webhook signature verification middleware","timestamp":"2026-05-31T03:58:00Z","repository":"payments-api"}',
    '{"hash":"f2c8e1a","author":"riley.gupta","message":"chore: upgrade jsonwebtoken from 9.x to 10.x for CVE patch","timestamp":"2026-05-31T03:25:00Z","repository":"auth-service"}',
    '{"hash":"9d4b7c3","author":"riley.gupta","message":"refactor: switch from RS256 to ES256 signing algorithm","timestamp":"2026-05-31T03:32:00Z","repository":"auth-service"}',
    '{"hash":"b1e6a2f","author":"riley.gupta","message":"fix: update JWKS endpoint to serve ES256 public key","timestamp":"2026-05-31T03:38:00Z","repository":"auth-service"}',
    '{"hash":"4a2b91c","author":"drew.nakamura","message":"perf: increase bulk indexing batch size from 500 to 5000","timestamp":"2026-05-31T01:00:00Z","repository":"search-indexer"}',
    '{"hash":"c8f3d2e","author":"drew.nakamura","message":"feat: add product image embeddings to search index","timestamp":"2026-05-31T00:50:00Z","repository":"search-indexer"}',
    '{"hash":"5e7a1b9","author":"morgan.taylor","message":"chore: reduce indexer pod memory limit from 4Gi to 2Gi","timestamp":"2026-05-31T00:40:00Z","repository":"search-indexer"}',
    '{"hash":"d7f2c4b","author":"casey.patel","message":"ops: migrate DB connection config to use env-based pooling","timestamp":"2026-05-31T03:00:00Z","repository":"order-processor"}',
    '{"hash":"8a1e5d3","author":"alex.rodriguez","message":"feat: add order fraud scoring before processing","timestamp":"2026-05-31T02:50:00Z","repository":"order-processor"}',
    '{"hash":"6c3a9e1","author":"morgan.taylor","message":"refactor: rewrite CDN routing rules for edge caching","timestamp":"2026-05-31T02:00:00Z","repository":"edge-cdn"}',
    '{"hash":"b4d7f2c","author":"morgan.taylor","message":"feat: add cache-busting query params to static assets","timestamp":"2026-05-31T02:05:00Z","repository":"edge-cdn"}',
    '{"hash":"aa9f1c2","author":"riley.gupta","message":"chore: update CI pipeline with new test stage","timestamp":"2026-05-30T22:00:00Z","repository":"infra-tools"}',
  ].join("\n"),
  sentry: [
    '{"error_type":"TypeError: Cannot read properties of null","count":847,"first_seen":"2026-05-31T04:25:00Z","level":"fatal","service":"payments-api"}',
    '{"error_type":"StripeSignatureVerificationError","count":23,"first_seen":"2026-05-31T04:24:00Z","level":"error","service":"payments-api"}',
    '{"error_type":"ConnectionRefusedError: ECONNREFUSED","count":156,"first_seen":"2026-05-31T04:28:00Z","level":"fatal","service":"payments-api"}',
    '{"error_type":"JsonWebTokenError: invalid algorithm","count":12340,"first_seen":"2026-05-31T03:40:00Z","level":"fatal","service":"auth-service"}',
    '{"error_type":"JWKSError: no matching key found","count":3200,"first_seen":"2026-05-31T03:42:00Z","level":"error","service":"auth-service"}',
    '{"error_type":"JavaScript heap out of memory","count":34,"first_seen":"2026-05-31T01:20:00Z","level":"fatal","service":"search-indexer"}',
    '{"error_type":"ElasticsearchClientError: Request Timeout","count":12,"first_seen":"2026-05-31T01:22:00Z","level":"error","service":"search-indexer"}',
    '{"error_type":"Error: Cannot acquire connection from pool","count":4521,"first_seen":"2026-05-31T03:15:00Z","level":"fatal","service":"order-processor"}',
    '{"error_type":"TimeoutError: Order processing exceeded 60s","count":890,"first_seen":"2026-05-31T03:20:00Z","level":"error","service":"order-processor"}',
    '{"error_type":"SyntaxError: Unexpected token <","count":2340,"first_seen":"2026-05-31T02:10:00Z","level":"error","service":"edge-cdn"}',
    '{"error_type":"ChunkLoadError: Loading chunk vendors failed","count":890,"first_seen":"2026-05-31T02:12:00Z","level":"warning","service":"edge-cdn"}',
  ].join("\n"),
  datadog: [
    '{"metric_name":"http_5xx_rate","value":34.7,"host":"prod-payments-01","timestamp":"2026-05-31T04:26:00Z","service":"payments-api"}',
    '{"metric_name":"p99_response_time","value":12400,"host":"prod-payments-01","timestamp":"2026-05-31T04:26:00Z","service":"payments-api"}',
    '{"metric_name":"active_db_connections","value":100,"host":"prod-payments-01","timestamp":"2026-05-31T04:27:00Z","service":"payments-api"}',
    '{"metric_name":"cpu_usage","value":94,"host":"prod-payments-01","timestamp":"2026-05-31T04:27:00Z","service":"payments-api"}',
    '{"metric_name":"memory_heap_used","value":1890,"host":"prod-payments-01","timestamp":"2026-05-31T04:27:00Z","service":"payments-api"}',
    '{"metric_name":"auth_failure_rate","value":89.2,"host":"prod-auth-01","timestamp":"2026-05-31T03:41:00Z","service":"auth-service"}',
    '{"metric_name":"active_sessions","value":3200,"host":"prod-auth-01","timestamp":"2026-05-31T03:41:00Z","service":"auth-service"}',
    '{"metric_name":"api_gateway_4xx_rate","value":78.5,"host":"prod-gateway-01","timestamp":"2026-05-31T03:42:00Z","service":"auth-service"}',
    '{"metric_name":"memory_usage","value":99.8,"host":"prod-search-01","timestamp":"2026-05-31T01:20:00Z","service":"search-indexer"}',
    '{"metric_name":"pod_restart_count","value":14,"host":"prod-search-01","timestamp":"2026-05-31T01:25:00Z","service":"search-indexer"}',
    '{"metric_name":"rabbitmq_queue_depth","value":52341,"host":"prod-queue-01","timestamp":"2026-05-31T03:17:00Z","service":"order-processor"}',
    '{"metric_name":"db_pool_active","value":50,"host":"prod-orders-01","timestamp":"2026-05-31T03:17:00Z","service":"order-processor"}',
    '{"metric_name":"cdn_cache_hit_ratio","value":61.2,"host":"edge-us-east","timestamp":"2026-05-31T02:10:00Z","service":"edge-cdn"}',
    '{"metric_name":"frontend_error_rate","value":12.4,"host":"edge-us-east","timestamp":"2026-05-31T02:11:00Z","service":"edge-cdn"}',
    '{"metric_name":"page_load_time_p50","value":4.8,"host":"edge-us-east","timestamp":"2026-05-31T02:11:00Z","service":"edge-cdn"}',
    '{"metric_name":"cpu_usage","value":22,"host":"prod-auth-01","timestamp":"2026-05-31T02:00:00Z","service":"auth-service"}',
    '{"metric_name":"cpu_usage","value":40,"host":"prod-orders-01","timestamp":"2026-05-31T02:00:00Z","service":"order-processor"}',
  ].join("\n"),
  pagerduty: [
    '{"id":1,"title":"Payment gateway returning 502 on checkout flow","service":"payments-api","urgency":"high","status":"triggered","created_at":"2026-05-31T04:24:00Z"}',
    '{"id":2,"title":"JWT validation failures causing mass logouts","service":"auth-service","urgency":"high","status":"acknowledged","created_at":"2026-05-31T03:41:00Z"}',
    '{"id":3,"title":"Search indexer OOM — product search returning empty","service":"search-indexer","urgency":"high","status":"acknowledged","created_at":"2026-05-31T01:20:00Z"}',
    '{"id":4,"title":"Order processing queue backlog exceeding 50k","service":"order-processor","urgency":"high","status":"resolved","created_at":"2026-05-31T03:17:00Z"}',
    '{"id":5,"title":"CDN serving stale JavaScript bundles","service":"edge-cdn","urgency":"low","status":"resolved","created_at":"2026-05-31T02:10:00Z"}',
    '{"id":6,"title":"Redis cluster failover — session store timeouts","service":"session-store","urgency":"high","status":"resolved","created_at":"2026-05-30T22:00:00Z"}',
    '{"id":7,"title":"Kafka consumer lag on analytics pipeline","service":"analytics-ingest","urgency":"low","status":"resolved","created_at":"2026-05-30T18:00:00Z"}',
    '{"id":8,"title":"TLS certificate renewal failure on service mesh","service":"service-mesh","urgency":"low","status":"resolved","created_at":"2026-05-30T14:00:00Z"}',
  ].join("\n"),
  slack: [
    '{"user":"pagerduty-bot","text":"🔴 CRITICAL: payments-api health check FAILING. 3 consecutive failures. Escalating.","channel":"sre-alerts","timestamp":"2026-05-31T04:24:00Z"}',
    '{"user":"sarah.chen","text":"I\'m on it. Seeing massive 502 spike on payments endpoint. Pulling up Datadog.","channel":"incidents","timestamp":"2026-05-31T04:26:00Z"}',
    '{"user":"jordan.kim","text":"I just merged a Stripe webhook refactor 40 min ago. Could be my PR #284.","channel":"incidents","timestamp":"2026-05-31T04:27:00Z"}',
    '{"user":"sarah.chen","text":"Confirmed. Sentry shows TypeError at StripeHandler.ts:142. The async pipeline isn\'t awaiting event body parse.","channel":"incidents","timestamp":"2026-05-31T04:29:00Z"}',
    '{"user":"drew.nakamura","text":"DB connection pool is maxed at 100. The retry logic is hammering Postgres.","channel":"incidents","timestamp":"2026-05-31T04:31:00Z"}',
    '{"user":"sarah.chen","text":"Rolling back payments-api to v2.14.3. Executing now.","channel":"incidents","timestamp":"2026-05-31T04:33:00Z"}',
    '{"user":"deploy-bot","text":"✅ Rollback complete: payments-api v2.14.3 deployed. Health checks passing.","channel":"incidents","timestamp":"2026-05-31T04:35:00Z"}',
    '{"user":"sarah.chen","text":"5xx rate dropping. Down to 0.5%. Creating post-mortem.","channel":"incidents","timestamp":"2026-05-31T04:38:00Z"}',
    '{"user":"pagerduty-bot","text":"🔴 CRITICAL: auth-service 401 rate exceeding 85%.","channel":"sre-alerts","timestamp":"2026-05-31T03:41:00Z"}',
    '{"user":"alex.rodriguez","text":"Getting flooded with support tickets. Users can\'t stay logged in.","channel":"incidents","timestamp":"2026-05-31T03:43:00Z"}',
    '{"user":"riley.gupta","text":"I upgraded jsonwebtoken and switched to ES256 about an hour ago. Existing RS256 tokens won\'t validate.","channel":"incidents","timestamp":"2026-05-31T03:45:00Z"}',
    '{"user":"alex.rodriguez","text":"That\'s the root cause. Rolling back the algo change now.","channel":"incidents","timestamp":"2026-05-31T03:47:00Z"}',
    '{"user":"k8s-watcher","text":"⚠️ Pod search-indexer-7f8b9c in CrashLoopBackOff. 14 restarts in last hour.","channel":"sre-alerts","timestamp":"2026-05-31T01:25:00Z"}',
    '{"user":"casey.patel","text":"Order queue backed up. DB connections exhausted. Checking pool config migration.","channel":"incidents","timestamp":"2026-05-31T03:20:00Z"}',
    '{"user":"morgan.taylor","text":"Getting reports of broken UIs after CDN routing rewrite. Cache key collision.","channel":"frontend","timestamp":"2026-05-31T02:15:00Z"}',
  ].join("\n"),
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

  // Map Aegis environment keys to the names expected by the Coral CLI binary
  if (process.env.DATADOG_API_KEY && !process.env.DD_API_KEY) {
    process.env.DD_API_KEY = process.env.DATADOG_API_KEY;
  }
  if (process.env.DATADOG_APP_KEY && !process.env.DD_APPLICATION_KEY) {
    process.env.DD_APPLICATION_KEY = process.env.DATADOG_APP_KEY;
  }
  if (process.env.PAGERDUTY_TOKEN && !process.env.PAGERDUTY_API_TOKEN) {
    process.env.PAGERDUTY_API_TOKEN = process.env.PAGERDUTY_TOKEN;
  }

  const integrations = [
    { name: "github", checkKeys: ["GITHUB_TOKEN"], tableName: "commits" },
    { name: "sentry", checkKeys: ["SENTRY_TOKEN", "SENTRY_ORG"], tableName: "issues" },
    { name: "datadog", checkKeys: ["DD_API_KEY", "DD_APPLICATION_KEY"], tableName: "metrics" },
    { name: "pagerduty", checkKeys: ["PAGERDUTY_API_TOKEN"], tableName: "incidents" },
    { name: "slack", checkKeys: ["SLACK_TOKEN"], tableName: "messages" }
  ];

  for (const integration of integrations) {
    const hasKeys = integration.checkKeys.every(
      (key) => process.env[key] && process.env[key].trim() !== ""
    );
    
    try {
      if (hasKeys) {
        console.log(`[Coral Bridge] Keys found for ${integration.name}. Onboarding live API source...`);
        await execAsync(`${coralCmd} source add ${integration.name}`);
      } else {
        console.log(`[Coral Bridge] Missing keys for ${integration.name}. Registering local file fallback...`);

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
  executionMeta?: {
    engine: string;
    coralVersion: string;
    executionTimeMs: number;
    sourcesQueried: string[];
    totalRows: number;
    command: string;
    dataMode: string;
  };
}> {
  const installed = await isCoralInstalled();

  if (!installed) {
    console.warn("[Coral Bridge] CLI not found. Running in simulated mode.");
    const mockData = getMockCoralData(sql);
    return {
      success: true,
      isMock: true,
      data: mockData,
      executionMeta: {
        engine: "aegis-mock-engine",
        coralVersion: "N/A (CLI not installed)",
        executionTimeMs: 0,
        sourcesQueried: detectSources(sql),
        totalRows: mockData.length,
        command: "[mock] " + sql,
        dataMode: "mock",
      },
    };
  }

  const coralCmd = fs.existsSync(localCoralPath) ? localCoralPath : "coral";

  // Ensure local file sources are registered
  await onboardCoralSources(coralCmd);

  // Get Coral version for metadata
  let coralVersion = "unknown";
  try {
    const { stdout: vOut } = await execAsync(`${coralCmd} --version`);
    coralVersion = vOut.trim();
  } catch { /* ignore */ }

  const startTime = Date.now();
  const sourcesQueried = detectSources(sql);

  try {
    const escapedSql = sql.replace(/"/g, '\\"');
    const fullCommand = `${coralCmd} sql "${escapedSql}" --format json`;
    console.log(`[Coral Bridge] Executing: ${fullCommand}`);

    const { stdout, stderr } = await execAsync(fullCommand);
    const executionTimeMs = Date.now() - startTime;

    if (stderr && !stdout) {
      // Coral CLI failed — fall back to mock with metadata explaining the fallback
      console.warn(`[Coral Bridge] CLI query failed (${stderr.substring(0, 200)}), falling back to local mock`);
      const mockData = getMockCoralData(sql);
      return {
        success: true,
        isMock: true,
        data: mockData,
        error: `Coral CLI error (used fallback): ${stderr.substring(0, 150)}`,
        executionMeta: {
          engine: "coral-cli (fallback to mock)",
          coralVersion,
          executionTimeMs,
          sourcesQueried,
          totalRows: mockData.length,
          command: fullCommand,
          dataMode: "local-file-fallback",
        },
      };
    }

    const parsed = JSON.parse(stdout);
    const data = Array.isArray(parsed) ? parsed : [parsed];

    return {
      success: true,
      data,
      isMock: false,
      executionMeta: {
        engine: "coral-cli",
        coralVersion,
        executionTimeMs,
        sourcesQueried,
        totalRows: data.length,
        command: fullCommand,
        dataMode: "local-file",
      },
    };
  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    // Coral threw — fall back gracefully to mock data so the demo never breaks
    console.warn(`[Coral Bridge] CLI exception, falling back to mock:`, error.message?.substring(0, 200));
    const mockData = getMockCoralData(sql);
    return {
      success: true,
      isMock: true,
      data: mockData,
      error: `Coral CLI exception (used fallback): ${(error.message || "").substring(0, 150)}`,
      executionMeta: {
        engine: "coral-cli (fallback to mock)",
        coralVersion,
        executionTimeMs,
        sourcesQueried,
        totalRows: mockData.length,
        command: sql,
        dataMode: "local-file-fallback",
      },
    };
  }
}

/**
 * Detects which Coral sources a SQL query references.
 */
function detectSources(sql: string): string[] {
  const q = sql.toLowerCase();
  const sources: string[] = [];
  if (q.includes("github") || q.includes("commits")) sources.push("github.commits");
  if (q.includes("sentry") || q.includes("issues") || q.includes("errors")) sources.push("sentry.issues");
  if (q.includes("datadog") || q.includes("metrics")) sources.push("datadog.metrics");
  if (q.includes("pagerduty") || q.includes("incidents")) sources.push("pagerduty.incidents");
  if (q.includes("slack") || q.includes("messages")) sources.push("slack.messages");
  return sources.length > 0 ? sources : ["pagerduty.incidents"];
}

/**
 * Returns a list of registered Coral sources and their status for the UI.
 */
export async function listCoralSources(): Promise<{
  installed: boolean;
  version: string;
  sources: Array<{ name: string; table: string; backend: string; rows: number }>;
}> {
  const installed = await isCoralInstalled();
  if (!installed) {
    return { installed: false, version: "N/A", sources: [] };
  }

  const coralCmd = fs.existsSync(localCoralPath) ? localCoralPath : "coral";
  await onboardCoralSources(coralCmd);

  let version = "unknown";
  try {
    const { stdout } = await execAsync(`${coralCmd} --version`);
    version = stdout.trim();
  } catch { /* ignore */ }

  // Count rows in each JSONL file
  const sourceInfo = [
    { name: "github", table: "commits", file: "commits.jsonl" },
    { name: "sentry", table: "issues", file: "issues.jsonl" },
    { name: "datadog", table: "metrics", file: "metrics.jsonl" },
    { name: "pagerduty", table: "incidents", file: "incidents.jsonl" },
    { name: "slack", table: "messages", file: "messages.jsonl" },
  ].map((s) => {
    const filePath = path.join(DATA_ROOT, s.name, s.file);
    let rows = 0;
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      rows = content.split("\n").filter((l) => l.trim()).length;
    } catch { /* file may not exist yet */ }
    return { name: s.name, table: `${s.name}.${s.table}`, backend: "local-file (JSONL)", rows };
  });

  return { installed: true, version, sources: sourceInfo };
}



/**
 * Smarter fallback mock generator. Parses query keywords and returns
 * scenario-appropriate rows. Supports basic WHERE-like filtering and
 * cross-source JOIN results.
 */
function getMockCoralData(sql: string): any[] {
  const q = sql.toLowerCase();

  // Extract a service filter if present (e.g. WHERE service = 'payments-api')
  const serviceMatch = q.match(/service\s*=\s*'([^']+)'/);
  const filterService = serviceMatch?.[1] ?? null;

  // ── Cross-source JOIN results (the Coral killer feature) ──
  if (q.includes("join")) {
    const joinRows = [
      { commit_hash: "a3f8c1d", commit_author: "jordan.kim", commit_message: "refactor: migrate Stripe webhook handler", error_type: "TypeError: Cannot read properties of null", error_count: 847, metric: "http_5xx_rate", metric_value: 34.7, service: "payments-api" },
      { commit_hash: "9d4b7c3", commit_author: "riley.gupta", commit_message: "refactor: switch from RS256 to ES256", error_type: "JsonWebTokenError: invalid algorithm", error_count: 12340, metric: "auth_failure_rate", metric_value: 89.2, service: "auth-service" },
      { commit_hash: "4a2b91c", commit_author: "drew.nakamura", commit_message: "perf: increase bulk indexing batch size", error_type: "JavaScript heap out of memory", error_count: 34, metric: "memory_usage", metric_value: 99.8, service: "search-indexer" },
      { commit_hash: "d7f2c4b", commit_author: "casey.patel", commit_message: "ops: migrate DB connection config", error_type: "Error: Cannot acquire connection from pool", error_count: 4521, metric: "rabbitmq_queue_depth", metric_value: 52341, service: "order-processor" },
      { commit_hash: "6c3a9e1", commit_author: "morgan.taylor", commit_message: "refactor: rewrite CDN routing rules", error_type: "SyntaxError: Unexpected token <", error_count: 2340, metric: "cdn_cache_hit_ratio", metric_value: 61.2, service: "edge-cdn" },
    ];
    return filterService
      ? joinRows.filter((r) => r.service === filterService)
      : joinRows;
  }

  // ── GitHub commits ──
  if (q.includes("github") || q.includes("commits") || q.includes("commit")) {
    const rows = [
      { hash: "a3f8c1d", author: "jordan.kim", message: "refactor: migrate Stripe webhook handler to async pipeline", timestamp: "2026-05-31T04:22:00Z", repository: "payments-api" },
      { hash: "7b2e9f4", author: "jordan.kim", message: "fix: add retry logic for idempotent payment captures", timestamp: "2026-05-31T04:18:00Z", repository: "payments-api" },
      { hash: "e5d1a08", author: "casey.patel", message: "chore: bump stripe-node from 14.x to 15.x", timestamp: "2026-05-31T04:05:00Z", repository: "payments-api" },
      { hash: "f2c8e1a", author: "riley.gupta", message: "chore: upgrade jsonwebtoken from 9.x to 10.x", timestamp: "2026-05-31T03:25:00Z", repository: "auth-service" },
      { hash: "9d4b7c3", author: "riley.gupta", message: "refactor: switch from RS256 to ES256 signing algorithm", timestamp: "2026-05-31T03:32:00Z", repository: "auth-service" },
      { hash: "4a2b91c", author: "drew.nakamura", message: "perf: increase bulk indexing batch size from 500 to 5000", timestamp: "2026-05-31T01:00:00Z", repository: "search-indexer" },
      { hash: "d7f2c4b", author: "casey.patel", message: "ops: migrate DB connection config to env-based pooling", timestamp: "2026-05-31T03:00:00Z", repository: "order-processor" },
      { hash: "6c3a9e1", author: "morgan.taylor", message: "refactor: rewrite CDN routing rules for edge caching", timestamp: "2026-05-31T02:00:00Z", repository: "edge-cdn" },
    ];
    return filterService
      ? rows.filter((r) => r.repository === filterService)
      : rows;
  }

  // ── Sentry errors ──
  if (q.includes("sentry") || q.includes("errors") || q.includes("issues")) {
    const rows = [
      { error_type: "TypeError: Cannot read properties of null", count: 847, first_seen: "2026-05-31T04:25:00Z", level: "fatal", service: "payments-api" },
      { error_type: "StripeSignatureVerificationError", count: 23, first_seen: "2026-05-31T04:24:00Z", level: "error", service: "payments-api" },
      { error_type: "ConnectionRefusedError: ECONNREFUSED", count: 156, first_seen: "2026-05-31T04:28:00Z", level: "fatal", service: "payments-api" },
      { error_type: "JsonWebTokenError: invalid algorithm", count: 12340, first_seen: "2026-05-31T03:40:00Z", level: "fatal", service: "auth-service" },
      { error_type: "JavaScript heap out of memory", count: 34, first_seen: "2026-05-31T01:20:00Z", level: "fatal", service: "search-indexer" },
      { error_type: "Error: Cannot acquire connection from pool", count: 4521, first_seen: "2026-05-31T03:15:00Z", level: "fatal", service: "order-processor" },
      { error_type: "SyntaxError: Unexpected token <", count: 2340, first_seen: "2026-05-31T02:10:00Z", level: "error", service: "edge-cdn" },
    ];
    if (q.includes("fatal")) return rows.filter((r) => r.level === "fatal");
    return filterService
      ? rows.filter((r) => r.service === filterService)
      : rows;
  }

  // ── Datadog metrics ──
  if (q.includes("datadog") || q.includes("metrics") || q.includes("cpu") || q.includes("memory")) {
    const rows = [
      { metric_name: "http_5xx_rate", value: 34.7, host: "prod-payments-01", timestamp: "2026-05-31T04:26:00Z", service: "payments-api" },
      { metric_name: "p99_response_time", value: 12400, host: "prod-payments-01", timestamp: "2026-05-31T04:26:00Z", service: "payments-api" },
      { metric_name: "cpu_usage", value: 94, host: "prod-payments-01", timestamp: "2026-05-31T04:27:00Z", service: "payments-api" },
      { metric_name: "auth_failure_rate", value: 89.2, host: "prod-auth-01", timestamp: "2026-05-31T03:41:00Z", service: "auth-service" },
      { metric_name: "memory_usage", value: 99.8, host: "prod-search-01", timestamp: "2026-05-31T01:20:00Z", service: "search-indexer" },
      { metric_name: "rabbitmq_queue_depth", value: 52341, host: "prod-queue-01", timestamp: "2026-05-31T03:17:00Z", service: "order-processor" },
      { metric_name: "cdn_cache_hit_ratio", value: 61.2, host: "edge-us-east", timestamp: "2026-05-31T02:10:00Z", service: "edge-cdn" },
    ];
    return filterService
      ? rows.filter((r) => r.service === filterService)
      : rows;
  }

  // ── Slack messages ──
  if (q.includes("slack") || q.includes("messages") || q.includes("chat")) {
    const channelMatch = q.match(/channel\s*=\s*'([^']+)'/);
    const rows = [
      { user: "pagerduty-bot", text: "🔴 CRITICAL: payments-api health check FAILING.", channel: "sre-alerts", timestamp: "2026-05-31T04:24:00Z" },
      { user: "sarah.chen", text: "Seeing massive 502 spike on payments. Pulling up Datadog.", channel: "incidents", timestamp: "2026-05-31T04:26:00Z" },
      { user: "jordan.kim", text: "I just merged a Stripe webhook refactor 40 min ago.", channel: "incidents", timestamp: "2026-05-31T04:27:00Z" },
      { user: "sarah.chen", text: "Confirmed: TypeError at StripeHandler.ts:142.", channel: "incidents", timestamp: "2026-05-31T04:29:00Z" },
      { user: "deploy-bot", text: "✅ Rollback complete: payments-api v2.14.3 deployed.", channel: "incidents", timestamp: "2026-05-31T04:35:00Z" },
      { user: "pagerduty-bot", text: "🔴 CRITICAL: auth-service 401 rate exceeding 85%.", channel: "sre-alerts", timestamp: "2026-05-31T03:41:00Z" },
      { user: "riley.gupta", text: "I switched to ES256 about an hour ago. Existing RS256 tokens won't validate.", channel: "incidents", timestamp: "2026-05-31T03:45:00Z" },
      { user: "casey.patel", text: "Order queue backed up. DB connections exhausted.", channel: "incidents", timestamp: "2026-05-31T03:20:00Z" },
    ];
    if (channelMatch) return rows.filter((r) => r.channel === channelMatch[1]);
    return rows;
  }

  // ── PagerDuty incidents (default) ──
  const rows = [
    { id: 1, title: "Payment gateway returning 502 on checkout", service: "payments-api", urgency: "high", status: "triggered", created_at: "2026-05-31T04:24:00Z" },
    { id: 2, title: "JWT validation failures causing mass logouts", service: "auth-service", urgency: "high", status: "acknowledged", created_at: "2026-05-31T03:41:00Z" },
    { id: 3, title: "Search indexer OOM — empty search results", service: "search-indexer", urgency: "high", status: "acknowledged", created_at: "2026-05-31T01:20:00Z" },
    { id: 4, title: "Order processing queue backlog exceeding 50k", service: "order-processor", urgency: "high", status: "resolved", created_at: "2026-05-31T03:17:00Z" },
    { id: 5, title: "CDN serving stale JavaScript bundles", service: "edge-cdn", urgency: "low", status: "resolved", created_at: "2026-05-31T02:10:00Z" },
  ];
  if (q.includes("triggered")) return rows.filter((r) => r.status === "triggered");
  if (q.includes("critical") || q.includes("high")) return rows.filter((r) => r.urgency === "high");
  return filterService ? rows.filter((r) => r.service === filterService) : rows;
}

