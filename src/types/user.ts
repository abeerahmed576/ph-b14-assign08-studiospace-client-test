import type { authClient } from "@/lib/auth-client";

export type User = typeof authClient.$Infer.Session.user;
export type Session = typeof authClient.$Infer.Session;
