import { describe, expect, it } from "vitest";
import { runtimeDatabaseUrl } from "@/lib/database-url";

describe("runtime Supabase connections", () => {
  it("moves session-pool URLs to transaction mode with one connection", () => {
    const original = "postgresql://postgres.example:demo%21@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require";
    const result = new URL(runtimeDatabaseUrl(original)!);
    expect(result.port).toBe("6543");
    expect(result.searchParams.get("pgbouncer")).toBe("true");
    expect(result.searchParams.get("connection_limit")).toBe("1");
    expect(result.searchParams.get("sslmode")).toBe("require");
    expect(result.username).toBe("postgres.example");
    expect(result.password).toBe("demo%21");
    expect(original).toContain(":5432/");
  });
  it("preserves an explicitly configured pool limit", () => {
    const result = new URL(runtimeDatabaseUrl("postgresql://u:p@aws-0-region.pooler.supabase.com:6543/postgres?connection_limit=2")!);
    expect(result.searchParams.get("connection_limit")).toBe("2");
    expect(result.searchParams.get("pgbouncer")).toBe("true");
  });
  it("does not rewrite local, direct, unrelated, missing, or malformed URLs", () => {
    for (const value of [undefined, "invalid", "postgresql://localhost:5432/entryflow", "postgresql://db.project.supabase.co:5432/postgres", "postgresql://fake.pooler.supabase.com.example:5432/postgres"]) expect(runtimeDatabaseUrl(value)).toBe(value);
  });
});
