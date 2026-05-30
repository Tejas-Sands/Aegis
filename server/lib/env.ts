import "dotenv/config";

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  nimApiKey: process.env.NVIDIA_NIM_API_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};
