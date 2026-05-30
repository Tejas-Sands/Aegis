import Groq from "groq-sdk";

import { env } from "./env";

const groqApiKey = process.env.GROQ_API_KEY ?? "";
const primaryGroq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
const fallbackGroq = env.nimApiKey
  ? new Groq({ apiKey: env.nimApiKey, baseURL: "https://integrate.api.nvidia.com/v1" })
  : null;

function hasGroq(): boolean {
  return !!primaryGroq || !!fallbackGroq;
}

type ChatCompletionParams = Parameters<Groq.Chat.Completions["create"]>[0];

async function smartChatCompletion(
  params: Omit<ChatCompletionParams, "model">,
  models: { primary: string; fallback: string }
) {
  if (primaryGroq) {
    try {
      return await primaryGroq.chat.completions.create({
        ...params,
        model: models.primary,
      });
    } catch (error) {
      console.warn("[SmartEngine] Primary AI (Groq) failed, falling back to NVIDIA NIM:", error);
    }
  }

  if (fallbackGroq) {
    try {
      return await fallbackGroq.chat.completions.create({
        ...params,
        model: models.fallback,
      });
    } catch (error) {
      console.error("[SmartEngine] Fallback AI (NVIDIA NIM) also failed:", error);
      throw error;
    }
  }

  throw new Error("No AI providers configured or available.");
}

export async function analyzeIncidentWithAI(incidentData: {
  title: string;
  service: string;
  urgency: string;
  severity: string;
  description?: string | null;
  correlatedData: {
    commits: Array<{
      hash: string;
      message: string;
      author: string;
      timestamp: string;
    }>;
    errors: Array<{
      type: string;
      count: number;
      firstSeen: string;
      stackTrace: string;
    }>;
    metrics: Array<{
      name: string;
      normalValue: number;
      observedValue: number;
      unit: string;
    }>;
    slackMessages: Array<{
      channel: string;
      user: string;
      text: string;
      timestamp: string;
    }>;
  };
}): Promise<{
  summary: string;
  rootCause: string;
  contributingFactors: string[];
  recommendedActions: string[];
  confidence: number;
  relatedCommits: Array<{
    hash: string;
    message: string;
    author: string;
    timestamp: string;
  }>;
  errorPatterns: Array<{
    errorType: string;
    count: number;
    firstSeen: string;
    stackTraceSummary: string;
  }>;
  metricAnomalies: Array<{
    metric: string;
    normalValue: number;
    observedValue: number;
    deviation: string;
  }>;
  slackContext: string;
}> {
  if (!hasGroq()) {
    return generateFallbackAnalysis(incidentData);
  }

  const prompt = `You are AEGIS, an Autonomous SRE Investigator. Analyze the following incident data across multiple sources and provide a structured root cause analysis.

INCIDENT DETAILS:
- Title: ${incidentData.title}
- Service: ${incidentData.service}
- Urgency: ${incidentData.urgency}
- Severity: ${incidentData.severity}
- Description: ${incidentData.description ?? "N/A"}

CORRELATED DATA:

Recent Commits (last 2 hours):
${incidentData.correlatedData.commits.map((c) => `- ${c.hash.substring(0, 7)} by ${c.author}: ${c.message} (${c.timestamp})`).join("\n")}

Sentry Errors:
${incidentData.correlatedData.errors.map((e) => `- ${e.type}: ${e.count} occurrences, first seen ${e.firstSeen}`).join("\n")}

Datadog Metrics:
${incidentData.correlatedData.metrics.map((m) => `- ${m.name}: ${m.normalValue}${m.unit} → ${m.observedValue}${m.unit}`).join("\n")}

Slack Discussion (#incidents):
${incidentData.correlatedData.slackMessages.map((s) => `- [${s.timestamp}] ${s.user}: ${s.text}`).join("\n")}

Provide your analysis in this exact JSON format:
{
  "summary": "2-3 sentence incident summary",
  "rootCause": "Most likely root cause with specific evidence",
  "contributingFactors": ["factor 1", "factor 2"],
  "recommendedActions": ["action 1", "action 2", "action 3"],
  "confidence": 0.85,
  "relatedCommits": [
    {"hash": "abc1234", "message": "commit message", "author": "dev-name", "timestamp": "2024-01-01T10:00:00Z"}
  ],
  "errorPatterns": [
    {"errorType": "NullPointerException", "count": 47, "firstSeen": "2024-01-01T10:00:00Z", "stackTraceSummary": "at PaymentService.process()"}
  ],
  "metricAnomalies": [
    {"metric": "cpu_usage", "normalValue": 45, "observedValue": 95, "deviation": "+111%"}
  ],
  "slackContext": "Summary of team discussion and response actions"
}`;

  try {
    const completion = await smartChatCompletion(
      {
        messages: [
          {
            role: "system",
            content:
              "You are AEGIS, an expert Site Reliability Engineering AI. You analyze infrastructure incidents by correlating data across multiple observability platforms. Be precise, technical, and actionable. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      },
      {
        primary: "llama-3.3-70b-versatile",
        fallback: "meta/llama-3.3-70b-instruct",
      }
    );

    const response = (completion as any).choices[0]?.message?.content ?? "{}";
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

    return {
      summary: parsed.summary ?? "Analysis incomplete",
      rootCause: parsed.rootCause ?? "Unable to determine root cause",
      contributingFactors: parsed.contributingFactors ?? [],
      recommendedActions: parsed.recommendedActions ?? [],
      confidence: parsed.confidence ?? 0.5,
      relatedCommits: parsed.relatedCommits ?? [],
      errorPatterns: parsed.errorPatterns ?? [],
      metricAnomalies: parsed.metricAnomalies ?? [],
      slackContext: parsed.slackContext ?? "No Slack context available",
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return generateFallbackAnalysis(incidentData);
  }
}

function generateFallbackAnalysis(incidentData: {
  title: string;
  service: string;
  correlatedData: {
    commits: Array<{ hash: string; message: string; author: string; timestamp: string }>;
    errors: Array<{ type: string; count: number; firstSeen: string }>;
    metrics: Array<{ name: string; normalValue: number; observedValue: number; unit: string }>;
  };
}) {
  const topCommit = incidentData.correlatedData.commits[0];
  const topError = incidentData.correlatedData.errors[0];
  const topMetric = incidentData.correlatedData.metrics[0];

  return {
    summary: `Incident on ${incidentData.service}: ${incidentData.title}. Correlated data suggests a deployment-related issue.`,
    rootCause: topCommit
      ? `Most likely caused by commit ${topCommit.hash.substring(0, 7)} (${topCommit.message}) by ${topCommit.author}`
      : "Root cause could not be automatically determined from available data.",
    contributingFactors: [
      topCommit ? `Recent deployment: ${topCommit.message}` : "Unknown deployment activity",
      topError ? `Error spike: ${topError.type} (${topError.count} occurrences)` : "No error data",
      topMetric
        ? `Metric anomaly: ${topMetric.name} deviated from ${topMetric.normalValue}${topMetric.unit} to ${topMetric.observedValue}${topMetric.unit}`
        : "No metric anomalies detected",
    ],
    recommendedActions: [
      "Review recent deployments for the affected service",
      "Check application logs for error patterns",
      "Consider rolling back the most recent deployment if errors correlate with deploy time",
      "Monitor key metrics for recovery signs",
    ],
    confidence: 0.65,
    relatedCommits: incidentData.correlatedData.commits.slice(0, 3),
    errorPatterns: incidentData.correlatedData.errors.slice(0, 3).map((e) => ({
      errorType: e.type,
      count: e.count,
      firstSeen: e.firstSeen,
      stackTraceSummary: "See Sentry for full trace",
    })),
    metricAnomalies: incidentData.correlatedData.metrics.slice(0, 3).map((m) => ({
      metric: m.name,
      normalValue: m.normalValue,
      observedValue: m.observedValue,
      deviation: `${m.observedValue > m.normalValue ? "+" : ""}${Math.round(((m.observedValue - m.normalValue) / m.normalValue) * 100)}%`,
    })),
    slackContext: "Team has been notified and is investigating.",
  };
}

export async function generateSQLFromNL(params: {
  naturalLanguage: string;
  sources: string[];
}): Promise<{ sql: string; explanation: string }> {
  if (!hasGroq()) {
    return {
      sql: `-- Demo mode: Natural language to SQL conversion\n-- Query: "${params.naturalLanguage}"\nSELECT * FROM incidents WHERE status = 'triggered';`,
      explanation: "Demo mode: AI SQL generation requires GROQ_API_KEY to be configured.",
    };
  }

  const prompt = `Convert this natural language query into SQL for the AEGIS SRE platform.

Available data sources (each is a SQL table):
- pagerduty.incidents (id, title, service, urgency, status, created_at)
- datadog.metrics (id, metric_name, value, timestamp, host, tags)
- github.commits (id, hash, message, author, timestamp, repository)
- github.pull_requests (id, title, status, author, merged_at, branch)
- sentry.issues (id, title, error_type, count, first_seen, last_seen, level)
- slack.messages (id, text, channel, user, ts, thread_ts)

Natural language query: "${params.naturalLanguage}"

Respond with ONLY this JSON format:
{"sql": "the SQL query", "explanation": "brief explanation of what the query does"}`;

  try {
    const completion = await smartChatCompletion(
      {
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
      },
      {
        primary: "llama-3.3-70b-versatile",
        fallback: "meta/llama-3.3-70b-instruct",
      }
    );

    const response = (completion as any).choices[0]?.message?.content ?? "{}";
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

    return {
      sql: parsed.sql ?? "SELECT 'Query generation failed' as error",
      explanation: parsed.explanation ?? "Unable to generate explanation",
    };
  } catch {
    return {
      sql: "-- Query generation failed. Please try rephrasing your question.",
      explanation: "The AI model was unable to generate a SQL query from your input.",
    };
  }
}

export async function askAIQuestion(params: {
  question: string;
  context?: string;
}): Promise<{ answer: string; confidence: number }> {
  if (!hasGroq()) {
    return {
      answer: "Demo mode: AI Q&A requires GROQ_API_KEY to be configured. The full version will use Groq Cloud's llama-3.3-70b-versatile model for intelligent SRE assistance.",
      confidence: 0,
    };
  }

  try {
    const completion = await smartChatCompletion(
      {
        messages: [
          {
            role: "system",
            content:
              "You are AEGIS, an expert SRE assistant. Answer questions about infrastructure, incidents, debugging, and system reliability. Be concise and technical.",
          },
          {
            role: "user",
            content: params.context
              ? `Context: ${params.context}\n\nQuestion: ${params.question}`
              : params.question,
          },
        ],
        temperature: 0.4,
        max_tokens: 1024,
      },
      {
        primary: "llama-3.3-70b-versatile",
        fallback: "meta/llama-3.3-70b-instruct",
      }
    );

    const answer = (completion as any).choices[0]?.message?.content ?? "No response generated.";
    return { answer, confidence: 0.85 };
  } catch {
    return {
      answer: "AI service temporarily unavailable. Please try again later.",
      confidence: 0,
    };
  }
}
