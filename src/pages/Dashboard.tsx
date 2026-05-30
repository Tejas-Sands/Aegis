import { useEffect, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  Brain,
  Zap,
  Search,
  MessageSquare,
  Github,
  Bug,
  Bell,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
  Sparkles,
  Terminal,
  ChevronRight,
  Play,
} from "lucide-react";

export default function Dashboard() {
  const { isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const { data: stats } = trpc.incident.stats.useQuery();
  const { data: sourcesData } = trpc.dataSource.list.useQuery();
  const { data: activities } = trpc.activity.recent.useQuery({ limit: 10 });
  const { data: incidentsData } = trpc.incident.list.useQuery({ limit: 5 });
  const { data: coralStatus } = trpc.ai.checkCoralStatus.useQuery();

  const seedMutation = trpc.incident.seed.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const [nlQuery, setNlQuery] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    sql: string;
    explanation: string;
  } | null>(null);

  const [runningQuery, setRunningQuery] = useState(false);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isMockResult, setIsMockResult] = useState(false);

  const generateQuery = trpc.ai.generateQuery.useMutation({
    onSuccess: (data) => {
      setAiResponse(data);
      setAiThinking(false);
      // Reset execution result when new query is generated
      setQueryResult(null);
      setQueryError(null);
    },
    onError: () => {
      setAiThinking(false);
    },
  });

  const executeSQL = trpc.ai.executeSQL.useMutation({
    onSuccess: (data) => {
      setRunningQuery(false);
      if (data.success) {
        setQueryResult(data.data ?? []);
        setIsMockResult(data.isMock);
      } else {
        setQueryError(data.error ?? "Unknown execution error");
      }
    },
    onError: (err) => {
      setRunningQuery(false);
      setQueryError(err.message || "Failed to execute query");
    },
  });

  const handleNLSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setAiThinking(true);
    setAiResponse(null);
    generateQuery.mutate({
      naturalLanguage: nlQuery,
      sources: ["pagerduty", "datadog", "github", "sentry", "slack"],
    });
  };

  const handleExecuteClick = (sql: string) => {
    setRunningQuery(true);
    setQueryResult(null);
    setQueryError(null);
    executeSQL.mutate({ sql });
  };

  useEffect(() => {
    if (
      incidentsData &&
      incidentsData.incidents.length === 0 &&
      !seedMutation.isPending
    ) {
      seedMutation.mutate();
    }
  }, [incidentsData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030305] text-[#F0F0F2]">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
              <span className="text-xs font-mono text-[#00FF94] tracking-wider">
                FLEET OPERATIONAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              The Deck
            </h1>
            <p className="text-sm text-[#8A8A93] font-mono mt-1">
              Real-time incident plundering across all data sources
            </p>
          </div>
          <Link to="/incidents">
            <Button
              variant="outline"
              className="border-[#F0F0F2]/10 text-[#F0F0F2] hover:bg-[#F0F0F2]/5 font-mono text-sm"
            >
              View All Bounties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Incidents"
            value={stats?.totalIncidents ?? 0}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="#FFB800"
          />
          <StatCard
            label="Resolved"
            value={stats?.resolvedIncidents ?? 0}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="#00FF94"
          />
          <StatCard
            label="Active Alerts"
            value={stats?.activeAlerts ?? 0}
            icon={<Activity className="w-5 h-5" />}
            color="#00F0FF"
          />
          <StatCard
            label="MTTR (avg)"
            value="12m"
            icon={<Clock className="w-5 h-5" />}
            color="#F0F0F2"
            isText
          />
        </div>

        {/* Data Sources Status */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Connected Sources */}
          <Card className="bg-[#131318] border-[#F0F0F2]/10 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-[#8A8A93] flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FFB800]" />
                  DATA_SOURCES
                </span>
                <span className="text-[10px] bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 px-1.5 py-0.5 rounded font-normal">
                  {coralStatus?.installed ? "CORAL ACTIVE" : "CORAL LOCAL"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sourcesData?.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-[#0A0A0C] border border-[#F0F0F2]/5"
                >
                  <div className="flex items-center gap-3">
                    <SourceIcon name={source.icon ?? "activity"} />
                    <span className="text-sm font-mono">{source.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        source.status === "connected"
                          ? "bg-[#00FF94]"
                          : source.status === "syncing"
                          ? "bg-[#FFB800] animate-pulse"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs font-mono text-[#8A8A93] capitalize">
                      {source.status}
                    </span>
                  </div>
                </div>
              )) ?? (
                <div className="text-sm text-[#8A8A93] font-mono">
                  Scanning the seas...
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Query Interface */}
          <Card className="bg-[#131318] border-[#F0F0F2]/10 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-[#8A8A93] flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#00F0FF]" />
                AEGIS_FLEET_QUERY_ENGINE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNLSubmit} className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A93]" />
                    <Input
                      placeholder="Ask in natural language... e.g., 'Show me critical incidents on payments in last 2 hours'"
                      value={nlQuery}
                      onChange={(e) => setNlQuery(e.target.value)}
                      className="pl-10 bg-[#0A0A0C] border-[#F0F0F2]/10 text-[#F0F0F2] placeholder:text-[#8A8A93]/50 font-mono text-sm focus:border-[#00F0FF]/50 focus:ring-[#00F0FF]/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={aiThinking || !nlQuery.trim()}
                    className="bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 font-mono"
                  >
                    {aiThinking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>

              {aiResponse && (
                <div className="space-y-3">
                  <div className="bg-[#0A0A0C] rounded-md p-4 border border-[#00F0FF]/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#00F0FF]" />
                        <span className="text-xs font-mono text-[#00F0FF]">
                          GENERATED SQL
                        </span>
                      </div>
                      <Button
                        onClick={() => handleExecuteClick(aiResponse.sql)}
                        disabled={runningQuery}
                        className="h-7 px-3 bg-[#00FF94]/10 hover:bg-[#00FF94]/20 text-[#00FF94] border border-[#00FF94]/30 font-mono text-[10px] flex items-center gap-1"
                      >
                        {runningQuery ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        Execute on Coral
                      </Button>
                    </div>
                    <pre className="text-sm font-mono text-[#FFB800] overflow-x-auto whitespace-pre-wrap">
                      {aiResponse.sql}
                    </pre>
                  </div>
                  <p className="text-xs text-[#8A8A93] font-mono leading-relaxed">
                    {aiResponse.explanation}
                  </p>

                  {queryError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 font-mono text-xs">
                      Error: {queryError}
                    </div>
                  )}

                  {queryResult && (
                    <div className="bg-[#0A0A0C] border border-[#F0F0F2]/10 rounded-md p-3 overflow-hidden">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-[#8A8A93]">
                          QUERY_RESULT ({queryResult.length} rows)
                        </span>
                        {isMockResult && (
                          <span className="text-[9px] font-mono bg-[#FFB800]/10 text-[#FFB800] px-1.5 py-0.5 rounded border border-[#FFB800]/20">
                            LOCAL SIMULATION (Coral CLI not installed)
                          </span>
                        )}
                      </div>
                      <div className="overflow-x-auto text-[11px] font-mono text-[#F0F0F2] max-h-60 overflow-y-auto scrollbar-thin">
                        <table className="min-w-full divide-y divide-[#F0F0F2]/10">
                          <thead>
                            <tr>
                              {Object.keys(queryResult[0] || {}).map((k) => (
                                <th key={k} className="px-3 py-1.5 text-left text-xs font-mono text-[#8A8A93] capitalize border-b border-[#F0F0F2]/10">
                                  {k}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0F0F2]/5">
                            {queryResult.map((row, idx) => (
                              <tr key={idx}>
                                {Object.values(row).map((val: any, valIdx) => (
                                  <td key={valIdx} className="px-3 py-1.5 whitespace-nowrap text-[#F0F0F2]/80">
                                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!aiResponse && !aiThinking && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Critical incidents in last hour",
                    "Commits linked to payment errors",
                    "CPU spikes with deploy timeline",
                    "Slack mentions of #incidents",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setNlQuery(q);
                      }}
                      className="text-left text-xs font-mono text-[#8A8A93] hover:text-[#00F0FF] p-2 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5 hover:border-[#00F0FF]/20 transition-all"
                    >
                      <ChevronRight className="w-3 h-3 inline mr-1" />
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents + Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Incidents */}
          <Card className="bg-[#131318] border-[#F0F0F2]/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-[#8A8A93] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FFB800]" />
                RECENT_BOUNTIES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {incidentsData?.incidents.map((incident) => (
                <Link
                  key={incident.id}
                  to={`/incidents/${incident.id}`}
                  className="flex items-center justify-between py-3 px-3 rounded-md bg-[#0A0A0C] border border-[#F0F0F2]/5 hover:border-[#00F0FF]/20 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        incident.status === "triggered"
                          ? "bg-red-500 animate-pulse"
                          : incident.status === "acknowledged"
                          ? "bg-[#FFB800]"
                          : "bg-[#00FF94]"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-[#F0F0F2] group-hover:text-[#00F0FF] transition-colors">
                        {incident.title}
                      </p>
                      <p className="text-xs font-mono text-[#8A8A93]">
                        {incident.service} // {incident.severity}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8A93] group-hover:text-[#00F0FF] transition-colors flex-shrink-0" />
                </Link>
              )) ?? (
                <div className="text-sm text-[#8A8A93] font-mono py-8 text-center">
                  Loading bounties...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="bg-[#131318] border-[#F0F0F2]/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-[#8A8A93] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00FF94]" />
                SHIP_LOG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {activities?.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-2 px-3 rounded-md bg-[#0A0A0C] border border-[#F0F0F2]/5"
                >
                  <ActivityIcon type={log.type} />
                  <div className="min-w-0">
                    <p className="text-sm text-[#F0F0F2]">{log.message}</p>
                    <p className="text-xs font-mono text-[#8A8A93]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )) ?? (
                <div className="text-sm text-[#8A8A93] font-mono py-8 text-center">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── Subcomponents ─── */

function StatCard({
  label,
  value,
  icon,
  color,
  isText,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isText?: boolean;
}) {
  return (
    <Card className="bg-[#131318] border-[#F0F0F2]/10">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-[#8A8A93]">{label}</span>
          <span style={{ color }}>{icon}</span>
        </div>
        <div
          className={`font-bold ${isText ? "text-2xl" : "text-3xl"}`}
          style={{ color }}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function SourceIcon({ name }: { name: string }) {
  const iconClass = "w-4 h-4 text-[#8A8A93]";
  switch (name) {
    case "bell":
      return <Bell className={iconClass} />;
    case "activity":
      return <Activity className={iconClass} />;
    case "github":
      return <Github className={iconClass} />;
    case "bug":
      return <Bug className={iconClass} />;
    case "message-square":
      return <MessageSquare className={iconClass} />;
    default:
      return <Activity className={iconClass} />;
  }
}

function ActivityIcon({ type }: { type: string }) {
  const className = "w-4 h-4 mt-0.5 flex-shrink-0";
  switch (type) {
    case "incident_created":
      return <AlertTriangle className={`${className} text-[#FFB800]`} />;
    case "incident_updated":
      return <Activity className={`${className} text-[#00F0FF]`} />;
    case "analysis_generated":
      return <Brain className={`${className} text-[#00FF94]`} />;
    case "query_executed":
      return <Terminal className={`${className} text-[#8A8A93]`} />;
    case "source_connected":
      return <CheckCircle2 className={`${className} text-[#00FF94]`} />;
    case "alert_triggered":
      return <Zap className={`${className} text-red-500`} />;
    default:
      return <Activity className={`${className} text-[#8A8A93]`} />;
  }
}
