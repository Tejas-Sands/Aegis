import { findAnalysisByIncidentId } from "../_queries/incidents";

export async function sendSlackAnalysisMessage(
  incident: {
    externalId: string;
    title: string;
    service: string;
    severity: string;
  },
  analysis: {
    rootCause: string;
    confidence: string;
  }
) {
  const token = process.env.SLACK_TOKEN;
  if (!token || token.trim() === "") {
    console.log("[Slack Integration] SLACK_TOKEN not configured. Skipping Slack analysis post.");
    return;
  }

  const channel = process.env.SLACK_CHANNEL || "#incidents";

  const message = {
    channel: channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🔍 *Aegis AI Root Cause Analysis Generated* for *${incident.title}* (${incident.externalId})`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Service:*\n${incident.service}`
          },
          {
            type: "mrkdwn",
            text: `*Confidence:*\n${Math.round(Number(analysis.confidence) * 100)}%`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Detected Problem / Root Cause:*\n${analysis.rootCause}`
        }
      }
    ]
  };

  await postToSlack(token, message);
}

export async function sendSlackResolutionMessage(
  incident: {
    id: number;
    externalId: string;
    title: string;
    service: string;
    severity: string;
  }
) {
  const token = process.env.SLACK_TOKEN;
  if (!token || token.trim() === "") {
    console.log("[Slack Integration] SLACK_TOKEN not configured. Skipping Slack resolution post.");
    return;
  }

  const channel = process.env.SLACK_CHANNEL || "#incidents";

  // Try to find the root cause analysis if it exists
  let rootCause = "No AI analysis was executed for this incident.";
  try {
    const analysis = await findAnalysisByIncidentId(incident.id);
    if (analysis && analysis.rootCause) {
      rootCause = analysis.rootCause;
    }
  } catch (err) {
    console.warn("[Slack Integration] Failed to fetch root cause analysis:", err);
  }

  const message = {
    channel: channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `✅ *Incident Resolved / Fixed:* *${incident.title}* (${incident.externalId})`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Service:*\n${incident.service}`
          },
          {
            type: "mrkdwn",
            text: `*Severity:*\n${incident.severity.toUpperCase()}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Resolution Summary (Root Cause resolved):*\n${rootCause}`
        }
      }
    ]
  };

  await postToSlack(token, message);
}

async function postToSlack(token: string, payload: any) {
  try {
    console.log(`[Slack Integration] Posting message to Slack channel ${payload.channel}...`);
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const resData = await response.json() as any;
    if (!resData.ok) {
      console.error("[Slack Integration] Slack API error:", resData.error);
    } else {
      console.log("[Slack Integration] Slack message posted successfully.");
    }
  } catch (error) {
    console.error("[Slack Integration] Failed to connect to Slack API:", error);
  }
}
