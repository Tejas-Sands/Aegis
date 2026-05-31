// ──────────────────────────────────────────────────────────────
// Curated Incident Scenarios for Aegis Simulation Mode
// Each scenario tells a coherent production outage story where
// commits → errors → metrics → Slack are causally linked.
// ──────────────────────────────────────────────────────────────

interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  files?: string[];
}

interface SentryError {
  type: string;
  count: number;
  firstSeen: string;
  stackTrace: string;
}

interface Metric {
  name: string;
  normalValue: number;
  observedValue: number;
  unit: string;
}

interface SlackMessage {
  channel: string;
  user: string;
  text: string;
  timestamp: string;
}

interface Scenario {
  incident: {
    title: string;
    service: string;
    urgency: "high" | "low";
    severity: "critical" | "major" | "minor" | "warning";
    description: string;
    assignedTo: string;
  };
  commits: Commit[];
  errors: SentryError[];
  metrics: Metric[];
  slackMessages: SlackMessage[];
}

function ts(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

const SCENARIOS: Scenario[] = [
  // ── SCENARIO 1: Payment Gateway Crash ──
  {
    incident: {
      title: "Payment gateway returning 502 on checkout flow",
      service: "payments-api",
      urgency: "high",
      severity: "critical",
      description:
        "PagerDuty Alert: payments-api health check failing. Stripe webhook handler returning HTTP 502. Customer-facing checkout is completely broken. Revenue impact estimated at $4,200/min.",
      assignedTo: "sarah.chen",
    },
    commits: [
      { hash: "a3f8c1d", message: "refactor: migrate Stripe webhook handler to async pipeline", author: "jordan.kim", timestamp: ts(38), files: ["src/webhooks/StripeHandler.ts", "src/services/PaymentService.ts"] },
      { hash: "7b2e9f4", message: "fix: add retry logic for idempotent payment captures", author: "jordan.kim", timestamp: ts(42), files: ["src/services/PaymentService.ts"] },
      { hash: "e5d1a08", message: "chore: bump stripe-node from 14.x to 15.x", author: "casey.patel", timestamp: ts(55), files: ["package.json", "package-lock.json"] },
      { hash: "1c9b3e7", message: "feat: add webhook signature verification middleware", author: "jordan.kim", timestamp: ts(62), files: ["src/middleware/webhookAuth.ts"] },
    ],
    errors: [
      { type: "TypeError: Cannot read properties of null (reading 'payment_intent')", count: 847, firstSeen: ts(35), stackTrace: "at StripeHandler.processEvent (src/webhooks/StripeHandler.ts:142)\n  at async WebhookPipeline.execute (src/pipelines/WebhookPipeline.ts:58)\n  at async POST /api/webhooks/stripe (src/routes/payments.ts:24)" },
      { type: "StripeSignatureVerificationError", count: 23, firstSeen: ts(36), stackTrace: "at Webhook.constructEvent (node_modules/stripe/lib/Webhooks.ts:89)\n  at verifySignature (src/middleware/webhookAuth.ts:31)" },
      { type: "ConnectionRefusedError: ECONNREFUSED 10.0.3.12:5432", count: 156, firstSeen: ts(32), stackTrace: "at TCPConnectWrap.afterConnect (net.js:1141)\n  at Pool.connect (node_modules/pg-pool/index.js:45)\n  at PaymentService.capturePayment (src/services/PaymentService.ts:89)" },
    ],
    metrics: [
      { name: "http_5xx_rate", normalValue: 0.02, observedValue: 34.7, unit: "%" },
      { name: "p99_response_time", normalValue: 180, observedValue: 12400, unit: "ms" },
      { name: "active_db_connections", normalValue: 25, observedValue: 100, unit: "conns" },
      { name: "cpu_usage", normalValue: 35, observedValue: 94, unit: "%" },
      { name: "memory_heap_used", normalValue: 512, observedValue: 1890, unit: "MB" },
    ],
    slackMessages: [
      { channel: "#sre-alerts", user: "pagerduty-bot", text: "🔴 CRITICAL: payments-api health check FAILING. 3 consecutive failures. Escalating to on-call.", timestamp: ts(36) },
      { channel: "#incidents", user: "sarah.chen", text: "I'm on it. Seeing massive 502 spike on the payments endpoint. Pulling up Datadog now.", timestamp: ts(34) },
      { channel: "#incidents", user: "jordan.kim", text: "Oh no — I just merged a Stripe webhook refactor 40 min ago. Could be my PR #284.", timestamp: ts(33) },
      { channel: "#incidents", user: "sarah.chen", text: "Confirmed. Sentry shows TypeError at StripeHandler.ts:142 — `payment_intent` is null. Jordan, the new async pipeline isn't awaiting the event body parse.", timestamp: ts(31) },
      { channel: "#incidents", user: "drew.nakamura", text: "DB connection pool is also maxed at 100. The retry logic is hammering Postgres.", timestamp: ts(29) },
      { channel: "#incidents", user: "sarah.chen", text: "Rolling back payments-api to v2.14.3. Executing now.", timestamp: ts(27) },
      { channel: "#incidents", user: "deploy-bot", text: "✅ Rollback complete: payments-api v2.14.3 deployed to prod-payments-{1,2,3}. Health checks passing.", timestamp: ts(25) },
      { channel: "#incidents", user: "sarah.chen", text: "5xx rate dropping. Down to 0.5%. Customers should be able to checkout again. Creating post-mortem.", timestamp: ts(22) },
    ],
  },

  // ── SCENARIO 2: Auth Service Token Failure ──
  {
    incident: {
      title: "JWT validation failures causing mass logouts",
      service: "auth-service",
      urgency: "high",
      severity: "critical",
      description:
        "PagerDuty Alert: auth-service returning 401 for valid tokens. All downstream services rejecting authenticated requests. Users being force-logged-out across web and mobile apps.",
      assignedTo: "alex.rodriguez",
    },
    commits: [
      { hash: "f2c8e1a", message: "chore: upgrade jsonwebtoken from 9.x to 10.x for CVE-2024-33883 patch", author: "riley.gupta", timestamp: ts(95), files: ["package.json", "src/auth/TokenValidator.ts"] },
      { hash: "9d4b7c3", message: "refactor: switch from RS256 to ES256 signing algorithm", author: "riley.gupta", timestamp: ts(88), files: ["src/auth/TokenValidator.ts", "src/auth/TokenIssuer.ts", "config/keys.json"] },
      { hash: "b1e6a2f", message: "fix: update JWKS endpoint to serve ES256 public key", author: "riley.gupta", timestamp: ts(82), files: ["src/routes/wellKnown.ts"] },
    ],
    errors: [
      { type: "JsonWebTokenError: invalid algorithm", count: 12340, firstSeen: ts(80), stackTrace: "at TokenValidator.verify (src/auth/TokenValidator.ts:67)\n  at authMiddleware (src/middleware/auth.ts:23)\n  at Layer.handle (node_modules/express/lib/router/layer.js:95)" },
      { type: "JWKSError: no matching key found for kid", count: 3200, firstSeen: ts(78), stackTrace: "at JWKSClient.getSigningKey (node_modules/jwks-rsa/src/JwksClient.ts:112)\n  at TokenValidator.getPublicKey (src/auth/TokenValidator.ts:34)" },
    ],
    metrics: [
      { name: "auth_failure_rate", normalValue: 0.3, observedValue: 89.2, unit: "%" },
      { name: "active_sessions", normalValue: 48000, observedValue: 3200, unit: "sessions" },
      { name: "api_gateway_4xx_rate", normalValue: 2.1, observedValue: 78.5, unit: "%" },
      { name: "cpu_usage", normalValue: 22, observedValue: 68, unit: "%" },
    ],
    slackMessages: [
      { channel: "#sre-alerts", user: "pagerduty-bot", text: "🔴 CRITICAL: auth-service 401 rate exceeding 85%. Users being logged out.", timestamp: ts(79) },
      { channel: "#incidents", user: "alex.rodriguez", text: "Getting flooded with support tickets. Users can't stay logged in. Investigating auth-service now.", timestamp: ts(77) },
      { channel: "#incidents", user: "riley.gupta", text: "I upgraded jsonwebtoken and switched to ES256 about an hour ago. Existing RS256 tokens in the wild won't validate against the new algo.", timestamp: ts(75) },
      { channel: "#incidents", user: "alex.rodriguez", text: "That's the root cause. We need to support both RS256 and ES256 during the migration window. Rolling back the algo change.", timestamp: ts(73) },
      { channel: "#incidents", user: "deploy-bot", text: "✅ Rollback complete: auth-service v3.8.1 deployed. RS256 validation restored.", timestamp: ts(70) },
      { channel: "#incidents", user: "alex.rodriguez", text: "Sessions recovering. Active sessions climbing back to 40k. Crisis averted.", timestamp: ts(65) },
    ],
  },

  // ── SCENARIO 3: Search Indexer OOM ──
  {
    incident: {
      title: "Search indexer OOM kills — product search returning empty results",
      service: "search-indexer",
      urgency: "high",
      severity: "major",
      description:
        "PagerDuty Alert: search-indexer pods in CrashLoopBackOff. Elasticsearch index is stale. Product search returning 0 results for all queries. Last successful index: 4 hours ago.",
      assignedTo: "morgan.taylor",
    },
    commits: [
      { hash: "4a2b91c", message: "perf: increase bulk indexing batch size from 500 to 5000 for throughput", author: "drew.nakamura", timestamp: ts(240), files: ["src/indexer/BulkIndexer.ts", "config/indexer.yaml"] },
      { hash: "c8f3d2e", message: "feat: add product image embeddings to search index", author: "drew.nakamura", timestamp: ts(250), files: ["src/indexer/ProductTransformer.ts", "src/models/SearchDocument.ts"] },
      { hash: "5e7a1b9", message: "chore: reduce indexer pod memory limit from 4Gi to 2Gi", author: "morgan.taylor", timestamp: ts(260), files: ["k8s/search-indexer/deployment.yaml"] },
    ],
    errors: [
      { type: "JavaScript heap out of memory", count: 34, firstSeen: ts(220), stackTrace: "FATAL ERROR: Reached heap limit Allocation failed\n  at BulkIndexer.processBatch (src/indexer/BulkIndexer.ts:89)\n  at BulkIndexer.run (src/indexer/BulkIndexer.ts:45)" },
      { type: "ElasticsearchClientError: Request Timeout after 30000ms", count: 12, firstSeen: ts(218), stackTrace: "at ClientRequest.<anonymous> (node_modules/@elastic/elasticsearch/lib/Connection.js:78)\n  at BulkIndexer.flush (src/indexer/BulkIndexer.ts:112)" },
    ],
    metrics: [
      { name: "memory_usage", normalValue: 65, observedValue: 99.8, unit: "%" },
      { name: "pod_restart_count", normalValue: 0, observedValue: 14, unit: "restarts" },
      { name: "search_result_count_avg", normalValue: 24.5, observedValue: 0, unit: "results" },
      { name: "index_lag", normalValue: 5, observedValue: 240, unit: "min" },
    ],
    slackMessages: [
      { channel: "#sre-alerts", user: "k8s-watcher", text: "⚠️ Pod search-indexer-7f8b9c in CrashLoopBackOff. 14 restarts in last hour.", timestamp: ts(215) },
      { channel: "#incidents", user: "morgan.taylor", text: "Search is completely down. Users searching for products get empty pages. Investigating.", timestamp: ts(212) },
      { channel: "#incidents", user: "drew.nakamura", text: "I bumped the batch size to 5000 yesterday for throughput. But Morgan reduced the pod memory to 2Gi last week. That combo is OOM-ing.", timestamp: ts(208) },
      { channel: "#incidents", user: "morgan.taylor", text: "Reverting batch size to 500 and bumping memory back to 4Gi. Deploying fix now.", timestamp: ts(205) },
      { channel: "#incidents", user: "deploy-bot", text: "✅ search-indexer v1.12.4 deployed. Pods stable. Index rebuild triggered.", timestamp: ts(200) },
    ],
  },

  // ── SCENARIO 4: Order Queue Backlog ──
  {
    incident: {
      title: "Order processing queue backlog exceeding 50k messages",
      service: "order-processor",
      urgency: "high",
      severity: "major",
      description:
        "PagerDuty Alert: RabbitMQ queue 'orders.process' depth at 52,341. Order confirmations delayed by 45+ minutes. Database connection pool saturated at max capacity.",
      assignedTo: "casey.patel",
    },
    commits: [
      { hash: "d7f2c4b", message: "ops: migrate DB connection config to use env-based pooling", author: "casey.patel", timestamp: ts(120), files: ["src/db/ConnectionPool.ts", "config/database.yaml"] },
      { hash: "8a1e5d3", message: "feat: add order fraud scoring before processing", author: "alex.rodriguez", timestamp: ts(130), files: ["src/processors/FraudScorer.ts", "src/processors/OrderProcessor.ts"] },
    ],
    errors: [
      { type: "Error: Cannot acquire connection from pool — timeout after 30s", count: 4521, firstSeen: ts(105), stackTrace: "at Pool.acquire (src/db/ConnectionPool.ts:45)\n  at OrderProcessor.processOrder (src/processors/OrderProcessor.ts:67)\n  at Consumer.onMessage (src/queue/RabbitConsumer.ts:34)" },
      { type: "TimeoutError: Order processing exceeded 60s deadline", count: 890, firstSeen: ts(100), stackTrace: "at DeadlineTimer.expire (src/utils/deadline.ts:12)\n  at OrderProcessor.processOrder (src/processors/OrderProcessor.ts:82)" },
    ],
    metrics: [
      { name: "rabbitmq_queue_depth", normalValue: 120, observedValue: 52341, unit: "msgs" },
      { name: "db_pool_active", normalValue: 15, observedValue: 50, unit: "conns" },
      { name: "order_processing_time_p99", normalValue: 800, observedValue: 62000, unit: "ms" },
      { name: "cpu_usage", normalValue: 40, observedValue: 88, unit: "%" },
    ],
    slackMessages: [
      { channel: "#sre-alerts", user: "rabbitmq-monitor", text: "⚠️ Queue orders.process depth: 52,341. Consumer lag critical.", timestamp: ts(103) },
      { channel: "#incidents", user: "casey.patel", text: "Queue is backed up. Looks like DB connections are exhausted. Checking the pool config migration I did this morning.", timestamp: ts(100) },
      { channel: "#incidents", user: "casey.patel", text: "Found it — the new env-based config set max_pool_size to 5 instead of 50. Typo in the YAML.", timestamp: ts(95) },
      { channel: "#incidents", user: "deploy-bot", text: "✅ Hot config push: order-processor pool size updated to 50. Rolling restart in progress.", timestamp: ts(92) },
      { channel: "#incidents", user: "casey.patel", text: "Queue draining. Down to 8k messages. Should be caught up in ~10 min.", timestamp: ts(85) },
    ],
  },

  // ── SCENARIO 5: CDN Cache Poisoning ──
  {
    incident: {
      title: "CDN serving stale JavaScript bundles after routing rewrite",
      service: "edge-cdn",
      urgency: "low",
      severity: "minor",
      description:
        "PagerDuty Alert: Frontend error rate elevated. Users reporting broken UI elements. CDN cache keys colliding after routing layer refactor — stale JS bundles being served to 12% of users.",
      assignedTo: "drew.nakamura",
    },
    commits: [
      { hash: "6c3a9e1", message: "refactor: rewrite CDN routing rules for edge caching", author: "morgan.taylor", timestamp: ts(180), files: ["infra/cdn/routing.tf", "infra/cdn/cache-keys.json"] },
      { hash: "b4d7f2c", message: "feat: add cache-busting query params to static assets", author: "morgan.taylor", timestamp: ts(175), files: ["src/build/assetPipeline.ts", "webpack.config.js"] },
    ],
    errors: [
      { type: "SyntaxError: Unexpected token '<' (loading HTML instead of JS)", count: 2340, firstSeen: ts(170), stackTrace: "at eval (<anonymous>)\n  at Module._compile (internal/modules/cjs/loader.js:776)\n  at client-bundle.js:1:1" },
      { type: "ChunkLoadError: Loading chunk 'vendors' failed", count: 890, firstSeen: ts(168), stackTrace: "at HTMLScriptElement.onScriptComplete (webpack/runtime/load-script.js:14)\n  at vendors-chunk-abc123.js:1:1" },
    ],
    metrics: [
      { name: "cdn_cache_hit_ratio", normalValue: 94.5, observedValue: 61.2, unit: "%" },
      { name: "frontend_error_rate", normalValue: 0.1, observedValue: 12.4, unit: "%" },
      { name: "page_load_time_p50", normalValue: 1.2, observedValue: 4.8, unit: "s" },
    ],
    slackMessages: [
      { channel: "#frontend", user: "morgan.taylor", text: "Getting reports of broken UIs. Some users see a blank page after the CDN routing rewrite I deployed.", timestamp: ts(165) },
      { channel: "#incidents", user: "drew.nakamura", text: "Cache key collision — the new routing rules are mapping different bundle versions to the same cache key. Old JS bundles being served.", timestamp: ts(160) },
      { channel: "#incidents", user: "morgan.taylor", text: "Purging CDN cache globally and fixing the cache-key template. Should resolve in 5-10 min.", timestamp: ts(155) },
      { channel: "#incidents", user: "deploy-bot", text: "✅ CDN cache purged. New routing rules deployed to all edge nodes.", timestamp: ts(150) },
    ],
  },
];

// ── Public API ──────────────────────────────────────────────

export function getScenarios(): Scenario[] {
  return SCENARIOS;
}

export function generateCorrelatedData(incidentTime: Date, service: string) {
  // Find the matching scenario for this service, or fall back to scenario 0
  const scenario =
    SCENARIOS.find((s) => s.incident.service === service) ?? SCENARIOS[0];

  return {
    commits: scenario.commits,
    errors: scenario.errors,
    metrics: scenario.metrics,
    slackMessages: scenario.slackMessages,
  };
}

export function generateMockIncidents(count: number = 8) {
  const now = Date.now();

  // First 5 are the curated scenarios (active and recent)
  const curated = SCENARIOS.map((s, i) => {
    const minutesAgo = [30, 75, 210, 100, 165][i];
    const createdAt = new Date(now - minutesAgo * 60_000);
    const status: "triggered" | "acknowledged" | "resolved" =
      i === 0 ? "triggered" : i < 3 ? "acknowledged" : "resolved";

    return {
      externalId: `AEG-${now}-${String(i).padStart(3, "0")}`,
      title: s.incident.title,
      service: s.incident.service,
      urgency: s.incident.urgency,
      status,
      description: s.incident.description,
      severity: s.incident.severity,
      createdAt,
      updatedAt: createdAt,
      resolvedAt:
        status === "resolved"
          ? new Date(createdAt.getTime() + 45 * 60_000)
          : null,
      assignedTo: s.incident.assignedTo,
    };
  });

  // Additional resolved historical incidents for depth
  const historical = [
    {
      title: "Redis cluster failover causing session store timeouts",
      service: "session-store",
      urgency: "high" as const,
      severity: "major" as const,
      description: "Redis primary node failed health checks. Sentinel initiated failover but 30s of write unavailability caused session creation failures.",
      assignedTo: "riley.gupta",
    },
    {
      title: "Kafka consumer lag on analytics pipeline",
      service: "analytics-ingest",
      urgency: "low" as const,
      severity: "warning" as const,
      description: "Kafka consumer group falling behind. Analytics dashboard showing 2-hour data delay. No customer-facing impact.",
      assignedTo: "jordan.kim",
    },
    {
      title: "TLS certificate renewal failure on internal mesh",
      service: "service-mesh",
      urgency: "low" as const,
      severity: "warning" as const,
      description: "cert-manager failed to renew internal mTLS certificates. Istio sidecar proxies logging TLS handshake errors between services.",
      assignedTo: "alex.rodriguez",
    },
  ].map((inc, i) => {
    const hoursAgo = 8 + i * 12;
    const createdAt = new Date(now - hoursAgo * 60 * 60_000);
    return {
      externalId: `AEG-${now}-${String(i + 5).padStart(3, "0")}`,
      ...inc,
      status: "resolved" as const,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + 30 * 60_000),
      resolvedAt: new Date(createdAt.getTime() + 45 * 60_000),
    };
  });

  return [...curated, ...historical].slice(0, count);
}
