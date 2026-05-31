import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAnalysisByIncidentId,
  createAnalysis,
  findIncidentById,
} from "./_queries/incidents";
import { createActivityLog } from "./_queries/activity";
import { analyzeIncidentWithAI } from "./lib/ai";
import { generateCorrelatedData } from "./lib/mockData";
import { sendSlackAnalysisMessage } from "./lib/slack";

export const analysisRouter = createRouter({
  getByIncidentId: publicQuery
    .input(z.object({ incidentId: z.number() }))
    .query(async ({ input }) => {
      return findAnalysisByIncidentId(input.incidentId);
    }),

  generate: publicQuery
    .input(z.object({ incidentId: z.number() }))
    .mutation(async ({ input }) => {
      const incident = await findIncidentById(input.incidentId);
      if (!incident) {
        throw new Error("Incident not found");
      }

      const correlatedData = generateCorrelatedData(
        incident.createdAt,
        incident.service
      );

      const aiResult = await analyzeIncidentWithAI({
        title: incident.title,
        service: incident.service,
        urgency: incident.urgency,
        severity: incident.severity,
        description: incident.description,
        correlatedData,
      });

      const analysis = await createAnalysis({
        incidentId: input.incidentId,
        summary: aiResult.summary,
        rootCause: aiResult.rootCause,
        contributingFactors: aiResult.contributingFactors,
        recommendedActions: aiResult.recommendedActions,
        confidence: aiResult.confidence.toString(),
        relatedCommits: aiResult.relatedCommits,
        errorPatterns: aiResult.errorPatterns,
        metricAnomalies: aiResult.metricAnomalies,
        slackContext: aiResult.slackContext,
        modelUsed: "llama-3.3-70b-versatile",
      });

      await createActivityLog({
        type: "analysis_generated",
        message: `AI analysis generated for incident ${incident.externalId} (confidence: ${Math.round(aiResult.confidence * 100)}%)`,
        metadata: {
          incidentId: incident.id,
          analysisId: analysis.id,
          confidence: aiResult.confidence,
        },
      });

      // Post AI Analysis to Slack asynchronously
      sendSlackAnalysisMessage(incident, analysis).catch(console.error);

      return analysis;
    }),
});
