import type {
  Incident,
  IncidentAnalysis,
  DataSource,
  ActivityLog,
  Query,
} from "@db/schema";

class MemoryStore {
  incidents: Incident[] = [];
  analyses: IncidentAnalysis[] = [];
  dataSources: DataSource[] = [];
  activityLogs: ActivityLog[] = [];
  queries: Query[] = [];
  idCounters = {
    incidents: 1,
    analyses: 1,
    dataSources: 1,
    activityLogs: 1,
    queries: 1,
  };

  nextId(table: keyof typeof this.idCounters): number {
    return this.idCounters[table]++;
  }

  reset() {
    this.incidents = [];
    this.analyses = [];
    this.dataSources = [];
    this.activityLogs = [];
    this.queries = [];
    this.idCounters = {
      incidents: 1,
      analyses: 1,
      dataSources: 1,
      activityLogs: 1,
      queries: 1,
    };
  }
}

export const memoryStore = new MemoryStore();

let dbAvailable = false;

export function isDbAvailable() {
  return dbAvailable;
}

export function setDbAvailable(available: boolean) {
  dbAvailable = available;
}
