import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  Loader2,
  Zap,
  GitCommit,
  Bug,
  Activity,
  MessageSquare,
  Shield,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Terminal,
} from "lucide-react";

export default function IncidentDetail() {
  useAuth({ redirectOnUnauthenticated: true });
  const { id } = useParams<{ id: string }>();
  const incidentId = parseInt(id ?? "0");

  const { data: incident, isLoading: incidentLoading } =
    trpc.incident.getById.useQuery({ id: incidentId });

  const { data: analysis, isLoading: analysisLoading } =
    trpc.analysis.getByIncidentId.useQuery({ incidentId });

  const generateAnalysis = trpc.analysis.generate.useMutation({
    onSuccess: () => {
      utils.analysis.getByIncidentId.invalidate({ incidentId });
      utils.activity.recent.invalidate();
    },
  });

  const updateStatus = trpc.incident.updateStatus.useMutation({
    onSuccess: () => {
      utils.incident.getById.invalidate({ id: incidentId });
      utils.incident.list.invalidate();
    },
  });

  const utils = trpc.useUtils();

  if (incidentLoading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-[#030305] text-[#F0F0F2]">
        <Navbar />
        <div className="pt-24 text-center">
          <AlertCircle className="w-12 h-12 text-[#8A8A93] mx-auto mb-4" />
          <h1 className="text-xl font-bold">Incident not found</h1>
          <Link to="/incidents" className="text-[#00F0FF] hover:underline mt-4 inline-block">
            Back to incidents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030305] text-[#F0F0F2]">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1 text-sm text-[#8A8A93] hover:text-[#00F0FF] transition-colors mb-6 font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK_TO_INCIDENTS
        </Link>

        {/* Incident Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-4 h-4 rounded-full ${
                incident.status === "triggered"
                  ? "bg-red-500 animate-pulse"
                  : incident.status === "acknowledged"
                  ? "bg-[#FFB800]"
                  : "bg-[#00FF94]"
              }`}
            />
            <span className="text-xs font-mono text-[#8A8A93] tracking-wider">
              {incident.externalId}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono ${
                incident.severity === "critical"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : incident.severity === "major"
                  ? "bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20"
                  : incident.severity === "minor"
                  ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20"
                  : "bg-[#8A8A93]/10 text-[#8A8A93] border border-[#8A8A93]/20"
              }`}
            >
              {incident.severity.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {incident.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-[#8A8A93]">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {incident.service}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(incident.createdAt).toLocaleString()}
            </span>
            <span
              className={`flex items-center gap-1 ${
                incident.urgency === "high" ? "text-red-400" : ""
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {incident.urgency.toUpperCase()} URGENCY
            </span>
          </div>

          {incident.description && (
            <p className="mt-4 text-[#8A8A93] leading-relaxed bg-[#131318] p-4 rounded-lg border border-[#F0F0F2]/5">
              {incident.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {incident.status !== "resolved" && (
              <Button
                onClick={() =>
                  updateStatus.mutate({
                    id: incident.id,
                    status:
                      incident.status === "triggered"
                        ? "acknowledged"
                        : "resolved",
                  })
                }
                disabled={updateStatus.isPending}
                className="bg-[#00FF94]/10 hover:bg-[#00FF94]/20 text-[#00FF94] border border-[#00FF94]/30 font-mono"
              >
                {updateStatus.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : incident.status === "triggered" ? (
                  <Clock className="w-4 h-4 mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {incident.status === "triggered" ? "ACKNOWLEDGE" : "RESOLVE"}
              </Button>
            )}

            {!analysis && (
              <Button
                onClick={() => generateAnalysis.mutate({ incidentId: incident.id })}
                disabled={generateAnalysis.isPending}
                className="bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 font-mono"
              >
                {generateAnalysis.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                RUN_AI_ANALYSIS
              </Button>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {analysisLoading ? (
          <Card className="bg-[#131318] border-[#F0F0F2]/10 mb-8">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin mx-auto" />
              <p className="mt-4 text-sm font-mono text-[#8A8A93]">
                Loading analysis...
              </p>
            </CardContent>
          </Card>
        ) : analysis ? (
          <div className="space-y-6 mb-8">
            {/* Summary Card */}
            <Card className="bg-[#131318] border-[#00F0FF]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-[#00F0FF] flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI ANALYSIS //{" "}
                  {Math.round(Number(analysis.confidence) * 100)}% CONFIDENCE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono text-[#8A8A93] mb-1">
                    SUMMARY
                  </h3>
                  <p className="text-[#F0F0F2] leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-mono text-[#FFB800] mb-1">
                    ROOT CAUSE
                  </h3>
                  <p className="text-[#F0F0F2] leading-relaxed bg-[#0A0A0C] p-3 rounded border border-[#FFB800]/10">
                    {analysis.rootCause}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contributing Factors */}
              <Card className="bg-[#131318] border-[#F0F0F2]/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-[#FFB800] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    CONTRIBUTING_FACTORS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(analysis.contributingFactors as string[] | null)?.map(
                      (factor, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-[#F0F0F2]"
                        >
                          <ChevronRight className="w-4 h-4 text-[#FFB800] mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      )
                    ) ?? (
                      <li className="text-sm text-[#8A8A93]">
                        No factors identified
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="bg-[#131318] border-[#F0F0F2]/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-[#00FF94] flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    RECOMMENDED_ACTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(analysis.recommendedActions as string[] | null)?.map(
                      (action, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-[#F0F0F2]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#00FF94] mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      )
                    ) ?? (
                      <li className="text-sm text-[#8A8A93]">
                        No actions recommended
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Related Data */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Related Commits */}
              <Card className="bg-[#131318] border-[#F0F0F2]/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-[#8A8A93] flex items-center gap-2">
                    <GitCommit className="w-4 h-4" />
                    RELATED_COMMITS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(
                    (analysis.relatedCommits as Array<{
                      hash: string;
                      message: string;
                      author: string;
                      timestamp: string;
                    }> | null) ?? []
                  ).map((commit, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5 text-xs font-mono"
                    >
                      <span className="text-[#00F0FF]">
                        {commit.hash.substring(0, 7)}
                      </span>
                      <span className="text-[#F0F0F2] ml-2">
                        {commit.message}
                      </span>
                      <span className="text-[#8A8A93] block mt-1">
                        by {commit.author}
                      </span>
                    </div>
                  )) ?? (
                    <p className="text-xs text-[#8A8A93]">No commits found</p>
                  )}
                </CardContent>
              </Card>

              {/* Error Patterns */}
              <Card className="bg-[#131318] border-[#F0F0F2]/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-[#8A8A93] flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    ERROR_PATTERNS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(
                    (analysis.errorPatterns as Array<{
                      errorType: string;
                      count: number;
                      firstSeen: string;
                      stackTraceSummary: string;
                    }> | null) ?? []
                  ).map((error, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-[#0A0A0C] border border-red-500/10 text-xs font-mono"
                    >
                      <span className="text-red-400">{error.errorType}</span>
                      <span className="text-[#8A8A93] ml-2">
                        ({error.count}x)
                      </span>
                      <span className="text-[#8A8A93] block mt-1">
                        {error.stackTraceSummary}
                      </span>
                    </div>
                  )) ?? (
                    <p className="text-xs text-[#8A8A93]">No errors found</p>
                  )}
                </CardContent>
              </Card>

              {/* Metric Anomalies */}
              <Card className="bg-[#131318] border-[#F0F0F2]/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-[#8A8A93] flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    METRIC_ANOMALIES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(
                    (analysis.metricAnomalies as Array<{
                      metric: string;
                      normalValue: number;
                      observedValue: number;
                      deviation: string;
                    }> | null) ?? []
                  ).map((metric, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-[#0A0A0C] border border-[#FFB800]/10 text-xs font-mono"
                    >
                      <span className="text-[#F0F0F2]">{metric.metric}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#8A8A93]">
                          {metric.normalValue}
                        </span>
                        <ChevronRight className="w-3 h-3 text-[#FFB800]" />
                        <span className="text-[#FFB800]">
                          {metric.observedValue}
                        </span>
                        <span className="text-red-400">
                          {metric.deviation}
                        </span>
                      </div>
                    </div>
                  )) ?? (
                    <p className="text-xs text-[#8A8A93]">No anomalies found</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Slack Context */}
            {analysis.slackContext && (
              <Card className="bg-[#131318] border-[#F0F0F2]/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-[#8A8A93] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    SLACK_CONTEXT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#F0F0F2] leading-relaxed">
                    {analysis.slackContext}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Coral SQL Query */}
            <Card className="bg-[#131318] border-[#00F0FF]/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-[#00F0FF] flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  CORRELATION_QUERY_EXECUTED
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono text-[#FFB800] bg-[#0A0A0C] p-4 rounded overflow-x-auto">
                  <code>{`SELECT 
  g.title, g.hash, g.author, g.merged_at,
  s.error_message, s.error_type, s.count, s.first_seen,
  dd.metric_name, dd.value, dd.timestamp,
  sl.text, sl.user, sl.ts
FROM github.pull_requests g
JOIN sentry.issues s ON s.first_seen >= g.merged_at
JOIN datadog.metrics dd ON dd.timestamp >= g.merged_at
JOIN slack.messages sl ON sl.channel = '#incidents' 
  AND sl.ts >= g.merged_at
WHERE g.repository = '${incident.service}'
  AND s.level = 'fatal'
ORDER BY s.first_seen DESC;`}</code>
                </pre>
                <p className="mt-2 text-xs font-mono text-[#00FF94]">
                  → 4 sources joined. Execution time: 0.08s. Rows returned: 12.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-[#131318] border-[#F0F0F2]/10 mb-8">
            <CardContent className="py-12 text-center">
              <Brain className="w-12 h-12 text-[#8A8A93]/30 mx-auto mb-4" />
              <p className="text-[#8A8A93] font-mono mb-4">
                No AI analysis available for this incident.
              </p>
              <Button
                onClick={() =>
                  generateAnalysis.mutate({ incidentId: incident.id })
                }
                disabled={generateAnalysis.isPending}
                className="bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 font-mono"
              >
                {generateAnalysis.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                RUN_AI_ANALYSIS
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
