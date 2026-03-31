import type { z } from "zod";

export type McpTool = {
  description: string;
  inputSchema: z.ZodObject<any>;
  execute: (params: any) => Promise<unknown>;
};

export type McpPrompt = {
  description: string;
  argsSchema: z.ZodObject<any>;
  execute: (args: Record<string, string>) => {
    messages: Array<{
      role: "user" | "assistant";
      content: { type: "text"; text: string };
    }>;
  };
};

export type MethodKeys<S> = {
  [K in keyof S]: S[K] extends (...args: any) => any ? K : never;
}[keyof S];

export type ServiceParams<S, M extends MethodKeys<S>> =
  S[M] extends (...args: any) => any ? Parameters<S[M]>[0] : never;

export type ServiceResponse<S, M extends MethodKeys<S>> =
  S[M] extends (...args: any) => any ? Awaited<ReturnType<S[M]>> : never;
