import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Search,
  Shield,
} from "lucide-react";

export default function Incidents() {
  useAuth({ redirectOnUnauthenticated: true });

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = trpc.incident.list.useQuery({
    status: statusFilter as "triggered" | "acknowledged" | "resolved" | undefined,
    urgency: urgencyFilter as "high" | "low" | undefined,
    limit: 50,
  });

  const updateStatus = trpc.incident.updateStatus.useMutation({
    onSuccess: () => {
      utils.incident.list.invalidate();
      utils.incident.stats.invalidate();
    },
  });

  const utils = trpc.useUtils();

  const filteredIncidents =
    data?.incidents.filter((inc) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.service.toLowerCase().includes(q) ||
        inc.externalId.toLowerCase().includes(q)
      );
    }) ?? [];

  return (
    <div className="min-h-screen bg-[#030305] text-[#F0F0F2]">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Bounties
            </h1>
            <p className="text-sm text-[#8A8A93] font-mono mt-1">
              {data?.total ?? 0} total bounties // {filteredIncidents.length} shown
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A93]" />
            <Input
              placeholder="Search incidents by title, service, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#131318] border-[#F0F0F2]/10 text-[#F0F0F2] placeholder:text-[#8A8A93]/50 font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#131318] border border-[#F0F0F2]/10 text-[#F0F0F2] text-sm font-mono rounded-md px-3 py-2 focus:outline-none focus:border-[#00F0FF]/50"
            >
              <option value="">All Status</option>
              <option value="triggered">Triggered</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-[#131318] border border-[#F0F0F2]/10 text-[#F0F0F2] text-sm font-mono rounded-md px-3 py-2 focus:outline-none focus:border-[#00F0FF]/50"
            >
              <option value="">All Urgency</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Incidents Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <Card className="bg-[#131318] border-[#F0F0F2]/10">
                <CardContent className="py-16 text-center">
                  <Shield className="w-12 h-12 text-[#8A8A93]/30 mx-auto mb-4" />
                  <p className="text-[#8A8A93] font-mono">
                    No bounties match your search, captain.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredIncidents.map((incident) => (
                <Card
                  key={incident.id}
                  className="bg-[#131318] border-[#F0F0F2]/10 hover:border-[#00F0FF]/20 transition-all group"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                            incident.status === "triggered"
                              ? "bg-red-500 animate-pulse"
                              : incident.status === "acknowledged"
                              ? "bg-[#FFB800]"
                              : "bg-[#00FF94]"
                          }`}
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/incidents/${incident.id}`}
                            className="text-base font-semibold text-[#F0F0F2] hover:text-[#00F0FF] transition-colors truncate block"
                          >
                            {incident.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-[#8A8A93]">
                            <span className="px-2 py-0.5 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5">
                              {incident.externalId}
                            </span>
                            <span>{incident.service}</span>
                            <span
                              className={`px-2 py-0.5 rounded ${
                                incident.severity === "critical"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : incident.severity === "major"
                                  ? "bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20"
                                  : incident.severity === "minor"
                                  ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20"
                                  : "bg-[#8A8A93]/10 text-[#8A8A93] border border-[#8A8A93]/20"
                              }`}
                            >
                              {incident.severity}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded ${
                                incident.urgency === "high"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-[#8A8A93]/10 text-[#8A8A93]"
                              }`}
                            >
                              {incident.urgency}
                            </span>
                          </div>
                          {incident.description && (
                            <p className="text-sm text-[#8A8A93] mt-2 line-clamp-2">
                              {incident.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {incident.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
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
                            className="border-[#00FF94]/30 text-[#00FF94] hover:bg-[#00FF94]/10 font-mono text-xs"
                          >
                            {incident.status === "triggered" ? (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                ACK
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                RESOLVE
                              </>
                            )}
                          </Button>
                        )}
                        <Link to={`/incidents/${incident.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#8A8A93] hover:text-[#00F0FF]"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
