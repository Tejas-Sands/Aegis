const COMMIT_MESSAGES = [
  "feat: add payment retry logic",
  "fix: handle null pointer in auth service",
  "refactor: optimize database queries",
  "chore: update dependencies",
  "feat: implement rate limiting",
  "fix: resolve memory leak in cache layer",
  "perf: improve API response times",
  "feat: add webhook validation",
  "fix: correct error handling in orders",
  "refactor: split monolithic service",
];

const AUTHORS = [
  "sarah.chen",
  "alex.rodriguez",
  "jordan.kim",
  "morgan.taylor",
  "casey.patel",
  "drew.nakamura",
  "riley.gupta",
];

const ERROR_TYPES = [
  "NullPointerException",
  "ConnectionTimeout",
  "DatabaseDeadlock",
  "MemoryExceeded",
  "RateLimitExceeded",
  "ValidationError",
  "AuthenticationFailed",
  "ServiceUnavailable",
];

const METRIC_NAMES = [
  { name: "cpu_usage", unit: "%", normal: 45 },
  { name: "memory_usage", unit: "%", normal: 60 },
  { name: "response_time_p99", unit: "ms", normal: 120 },
  { name: "error_rate", unit: "%", normal: 0.1 },
  { name: "request_latency", unit: "ms", normal: 80 },
  { name: "disk_io", unit: "MB/s", normal: 50 },
];

const SLACK_MESSAGES = [
  "Hey, seeing elevated errors on payments-service. Anyone else?",
  "Checking Datadog now. CPU is at 95%",
  "I just merged a PR for the payment retry logic. Might be related.",
  "Looking at Sentry - lots of NullPointerExceptions",
  "Can someone roll back the latest deploy?",
  "Rolling back payments-service to previous version",
  "Rollback complete. Monitoring now.",
  "Errors are dropping. Good call on the rollback.",
  "Creating a post-mortem doc. Let's review tomorrow.",
];

export function generateCorrelatedData(incidentTime: Date, service: string) {
  const timeMs = incidentTime.getTime();

  const commits = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => {
    const commitTime = new Date(timeMs - (2 - i) * 15 * 60 * 1000);
    return {
      hash: Array.from({ length: 7 }, () =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join(""),
      message: COMMIT_MESSAGES[Math.floor(Math.random() * COMMIT_MESSAGES.length)],
      author: AUTHORS[Math.floor(Math.random() * AUTHORS.length)],
      timestamp: commitTime.toISOString(),
    };
  });

  const errors = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => {
    const errorTime = new Date(timeMs - Math.random() * 30 * 60 * 1000);
    return {
      type: ERROR_TYPES[Math.floor(Math.random() * ERROR_TYPES.length)],
      count: 10 + Math.floor(Math.random() * 500),
      firstSeen: errorTime.toISOString(),
      stackTrace: `at ${service.replace("-", ".")}.service.Process(${Math.floor(Math.random() * 200) + 1})\n  at async ${service.replace("-", ".")}.handler(req, res)`,
    };
  });

  const metrics = METRIC_NAMES.slice(0, 3 + Math.floor(Math.random() * 3)).map((m) => {
    const multiplier = 1.5 + Math.random() * 2;
    return {
      name: m.name,
      normalValue: m.normal,
      observedValue: Math.round(m.normal * multiplier * 100) / 100,
      unit: m.unit,
    };
  });

  const slackMessages = Array.from(
    { length: 4 + Math.floor(Math.random() * 4) },
    (_, i) => {
      const msgTime = new Date(timeMs - (30 - i * 5) * 60 * 1000);
      return {
        channel: "#incidents",
        user: AUTHORS[i % AUTHORS.length],
        text: SLACK_MESSAGES[i % SLACK_MESSAGES.length],
        timestamp: msgTime.toISOString(),
      };
    }
  );

  return { commits, errors, metrics, slackMessages };
}

const SERVICE_NAMES = [
  "payments-service",
  "auth-service",
  "api-gateway",
  "notification-service",
  "user-service",
  "inventory-service",
  "search-service",
  "recommendation-engine",
];

const INCIDENT_TITLES = [
  "Elevated error rate on payment processing",
  "Database connection pool exhausted",
  "API Gateway latency spike detected",
  "Authentication service timeout errors",
  "Memory leak in notification worker",
  "Cache invalidation causing stale data",
  "Message queue backlog exceeding threshold",
  "SSL certificate validation failure",
  "Rate limiting misconfiguration",
  "Cross-service dependency failure",
];

export function generateMockIncidents(count: number = 12) {
  return Array.from({ length: count }, (_, i) => {
    const now = Date.now();
    const createdAt = new Date(now - i * 2 * 60 * 60 * 1000 - Math.random() * 60 * 60 * 1000);
    const service = SERVICE_NAMES[i % SERVICE_NAMES.length];

    return {
      externalId: `AEG-${Date.now()}-${String(i).padStart(3, "0")}`,
      title: INCIDENT_TITLES[i % INCIDENT_TITLES.length],
      service,
      urgency: (i % 3 === 0 ? "high" : "low") as "high" | "low",
      status: (i === 0 ? "triggered" : i < 3 ? "acknowledged" : "resolved") as
        | "triggered"
        | "acknowledged"
        | "resolved",
      description: `Automated alert: ${service} showing anomalous behavior. Error rate exceeded threshold at ${createdAt.toISOString()}. Correlated metrics indicate potential deployment impact.`,
      severity: (["critical", "major", "minor", "warning"] as const)[
        i % 4
      ],
      createdAt,
      updatedAt: createdAt,
      resolvedAt:
        i >= 3 ? new Date(createdAt.getTime() + 45 * 60 * 1000) : null,
      assignedTo: AUTHORS[i % AUTHORS.length],
    };
  });
}
