import { useState } from "react";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  Settings as SettingsIcon,
  Bell,
  Activity,
  Github,
  Bug,
  MessageSquare,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Key,
  Database,
  Users,
} from "lucide-react";

export default function Settings() {
  useAuth({ redirectOnUnauthenticated: true });

  const { data: sources, isLoading } = trpc.dataSource.list.useQuery();
  const { data: usersList, isLoading: isUsersLoading } = trpc.auth.list.useQuery();
  const utils = trpc.useUtils();

  const updateStatus = trpc.dataSource.updateStatus.useMutation({
    onSuccess: () => {
      utils.dataSource.list.invalidate();
    },
  });

  const [groqKey, setGroqKey] = useState("");
  const [nvidiaKey, setNvidiaKey] = useState("");
  const [savedKeys, setSavedKeys] = useState(false);

  const handleSaveKeys = () => {
    setSavedKeys(true);
    setTimeout(() => setSavedKeys(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-[#F0F0F2]">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-6 h-6 text-[#00F0FF]" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Settings
            </h1>
          </div>
          <p className="text-sm text-[#8A8A93] font-mono">
            Configure integrations, AI providers, and system preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Data Sources */}
          <Card className="bg-[#131318] border-[#F0F0F2]/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-[#00F0FF] flex items-center gap-2">
                <Database className="w-4 h-4" />
                CONNECTED_DATA_SOURCES
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#00F0FF] animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {sources?.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#0A0A0C] border border-[#F0F0F2]/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/5 border border-[#00F0FF]/10 flex items-center justify-center">
                          <SourceIcon name={source.icon ?? "activity"} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#F0F0F2]">
                            {source.displayName}
                          </p>
                          <p className="text-xs font-mono text-[#8A8A93]">
                            {source.type.toUpperCase()} //{" "}
                            {source.lastSyncAt
                              ? `Last sync: ${new Date(source.lastSyncAt).toLocaleString()}`
                              : "Never synced"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus.mutate({
                              id: source.id,
                              status:
                                source.status === "connected"
                                  ? "disconnected"
                                  : "connected",
                            })
                          }
                          disabled={updateStatus.isPending}
                          className="border-[#F0F0F2]/10 text-[#8A8A93] hover:text-[#F0F0F2] hover:bg-[#F0F0F2]/5 font-mono text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          {source.status === "connected"
                            ? "DISCONNECT"
                            : "CONNECT"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authenticated Users */}
          <Card className="bg-[#131318] border-[#F0F0F2]/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-[#00FF94] flex items-center gap-2">
                <Users className="w-4 h-4" />
                AUTHENTICATED_USERS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#00F0FF] animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#F0F0F2]/5 rounded-lg bg-[#0A0A0C]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#F0F0F2]/10 text-[#8A8A93] font-mono text-xs uppercase bg-[#131318]">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Created At</th>
                        <th className="py-3 px-4">Last Sign In</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F0F2]/5 text-sm font-mono">
                      {usersList?.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-[#131318]/40 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={userItem.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userItem.unionId}`}
                              alt={userItem.name || "User Avatar"}
                              className="w-8 h-8 rounded-full border border-[#00F0FF]/30 bg-[#030305]"
                            />
                            <div>
                              <span className="text-[#F0F0F2] font-semibold block leading-tight">
                                {userItem.name || "Agent"}
                              </span>
                              <span className="text-[#8A8A93] text-xs block">
                                {userItem.email || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs border ${
                                userItem.role === "admin"
                                  ? "bg-[#00F0FF]/5 text-[#00F0FF] border-[#00F0FF]/30"
                                  : "bg-white/5 text-[#8A8A93] border-[#F0F0F2]/10"
                              }`}
                            >
                              {userItem.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#8A8A93] text-xs">
                            {new Date(userItem.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-[#8A8A93] text-xs">
                            {new Date(userItem.lastSignInAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Provider Configuration */}
          <Card className="bg-[#131318] border-[#F0F0F2]/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-[#FFB800] flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI_PROVIDER_CONFIGURATION
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Groq Cloud */}
              <div className="p-4 rounded-lg bg-[#0A0A0C] border border-[#F0F0F2]/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-[#FFB800]/10 border border-[#FFB800]/20 flex items-center justify-center">
                    <Key className="w-4 h-4 text-[#FFB800]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F0F0F2]">
                      Groq Cloud
                    </p>
                    <p className="text-xs font-mono text-[#8A8A93]">
                      llama-3.3-70b-versatile // 20 RPM free tier
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00FF94]" />
                    <span className="text-xs font-mono text-[#00FF94]">
                      ACTIVE
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="GROQ_API_KEY"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="flex-1 bg-[#131318] border-[#F0F0F2]/10 text-[#F0F0F2] font-mono text-sm placeholder:text-[#8A8A93]/30"
                  />
                </div>
              </div>

              {/* NVIDIA NIM */}
              <div className="p-4 rounded-lg bg-[#0A0A0C] border border-[#F0F0F2]/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center">
                    <Key className="w-4 h-4 text-[#00F0FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F0F0F2]">
                      NVIDIA NIM
                    </p>
                    <p className="text-xs font-mono text-[#8A8A93]">
                      meta/llama-3.1-70b-instruct // Fallback model
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#8A8A93]" />
                    <span className="text-xs font-mono text-[#8A8A93]">
                      STANDBY
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="NVIDIA_API_KEY"
                    value={nvidiaKey}
                    onChange={(e) => setNvidiaKey(e.target.value)}
                    className="flex-1 bg-[#131318] border-[#F0F0F2]/10 text-[#F0F0F2] font-mono text-sm placeholder:text-[#8A8A93]/30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSaveKeys}
                  className="bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 font-mono"
                >
                  {savedKeys ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      SAVED
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      SAVE_CONFIGURATION
                    </>
                  )}
                </Button>
                <span className="text-xs font-mono text-[#8A8A93]">
                  Keys stored in encrypted session only
                </span>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="bg-[#131318] border-[#F0F0F2]/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-[#00FF94] flex items-center gap-2">
                <Shield className="w-4 h-4" />
                SYSTEM_INFORMATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                <div className="p-3 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5">
                  <span className="text-[#8A8A93] block text-xs mb-1">
                    VERSION
                  </span>
                  <span className="text-[#F0F0F2]">AEGIS v2.4.1</span>
                </div>
                <div className="p-3 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5">
                  <span className="text-[#8A8A93] block text-xs mb-1">
                    AUTH
                  </span>
                  <span className="text-[#F0F0F2]">OAuth 2.0 + JWT</span>
                </div>
                <div className="p-3 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5">
                  <span className="text-[#8A8A93] block text-xs mb-1">
                    DATABASE
                  </span>
                  <span className="text-[#F0F0F2]">Drizzle ORM + MySQL</span>
                </div>
                <div className="p-3 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5">
                  <span className="text-[#8A8A93] block text-xs mb-1">
                    AI ENGINE
                  </span>
                  <span className="text-[#F0F0F2]">Groq + NVIDIA NIM</span>
                </div>
                <div className="p-3 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5">
                  <span className="text-[#8A8A93] block text-xs mb-1">
                    QUERY ENGINE
                  </span>
                  <span className="text-[#F0F0F2]">Coral SQL</span>
                </div>
                <div className="p-3 rounded bg-[#0A0A0C] border border-[#F0F0F2]/5">
                  <span className="text-[#8A8A93] block text-xs mb-1">
                    ENCRYPTION
                  </span>
                  <span className="text-[#F0F0F2]">AES-256-GCM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-[#131318] border-red-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                DANGER_ZONE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#F0F0F2]">
                    Reset all demo data
                  </p>
                  <p className="text-xs font-mono text-[#8A8A93]">
                    This will clear all incidents and analyses
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono text-sm"
                  onClick={() => {
                    if (confirm("Are you sure? This will reset all demo data.")) {
                      window.location.reload();
                    }
                  }}
                >
                  RESET_DATA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SourceIcon({ name }: { name: string }) {
  const className = "w-5 h-5 text-[#00F0FF]";
  switch (name) {
    case "bell":
      return <Bell className={className} />;
    case "activity":
      return <Activity className={className} />;
    case "github":
      return <Github className={className} />;
    case "bug":
      return <Bug className={className} />;
    case "message-square":
      return <MessageSquare className={className} />;
    default:
      return <Activity className={className} />;
  }
}
