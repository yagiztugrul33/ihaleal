import { describe, expect, it, vi, beforeEach } from "vitest";

const mock = vi.hoisted(() => ({
  configured: false,
  invoke: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => mock.configured,
  supabase: { functions: { invoke: mock.invoke } },
}));

import { postChatMessageViaEdge } from "./postChatMessageClient";

describe("postChatMessageViaEdge", () => {
  beforeEach(() => {
    mock.configured = false;
    mock.invoke.mockReset();
  });

  it("returns supabase_not_configured when client off", async () => {
    mock.configured = false;
    const r = await postChatMessageViaEdge({
      threadId: "t",
      text: "hi",
      clientMsgId: "c",
    });
    expect(r).toEqual({ ok: false, code: "supabase_not_configured" });
    expect(mock.invoke).not.toHaveBeenCalled();
  });

  it("returns empty_message when text is blank after sanitize", async () => {
    mock.configured = true;
    const r = await postChatMessageViaEdge({
      threadId: "t",
      text: "   \u0003  ",
      clientMsgId: "c",
    });
    expect(r).toEqual({ ok: false, code: "empty_message" });
    expect(mock.invoke).not.toHaveBeenCalled();
  });

  it("returns edge_http_error for a FunctionsHttpError", async () => {
    mock.configured = true;
    mock.invoke.mockResolvedValue({
      data: null,
      error: { name: "FunctionsHttpError", message: "500" },
    });
    const r = await postChatMessageViaEdge({ threadId: "t", text: "hi", clientMsgId: "c" });
    expect(r).toEqual({ ok: false, code: "edge_http_error", detail: "500" });
  });

  it("returns edge_invoke_error for any other invoke error", async () => {
    mock.configured = true;
    mock.invoke.mockResolvedValue({
      data: null,
      error: { name: "FunctionsFetchError", message: "network" },
    });
    const r = await postChatMessageViaEdge({ threadId: "t", text: "hi", clientMsgId: "c" });
    expect(r).toEqual({ ok: false, code: "edge_invoke_error", detail: "network" });
  });

  it("returns empty_response when data is missing or not an object", async () => {
    mock.configured = true;
    mock.invoke.mockResolvedValue({ data: null, error: null });
    const r = await postChatMessageViaEdge({ threadId: "t", text: "hi", clientMsgId: "c" });
    expect(r).toEqual({ ok: false, code: "empty_response" });
  });

  it("returns the edge's own error code when data.ok is false", async () => {
    mock.configured = true;
    mock.invoke.mockResolvedValue({
      data: { ok: false, error: "flagged_content", detail: "yasak kelime" },
      error: null,
    });
    const r = await postChatMessageViaEdge({ threadId: "t", text: "hi", clientMsgId: "c" });
    expect(r).toEqual({ ok: false, code: "flagged_content", detail: "yasak kelime" });
  });

  it("falls back to edge_rejected when data.ok is false without an error code", async () => {
    mock.configured = true;
    mock.invoke.mockResolvedValue({ data: { ok: false }, error: null });
    const r = await postChatMessageViaEdge({ threadId: "t", text: "hi", clientMsgId: "c" });
    expect(r).toEqual({ ok: false, code: "edge_rejected", detail: undefined });
  });

  it("returns invalid_edge_payload when messageId or compliance is missing", async () => {
    mock.configured = true;
    mock.invoke.mockResolvedValue({ data: { ok: true }, error: null });
    const r = await postChatMessageViaEdge({ threadId: "t", text: "hi", clientMsgId: "c" });
    expect(r).toEqual({ ok: false, code: "invalid_edge_payload" });
  });

  it("returns a full success result and defaults an unrecognized severity to low", async () => {
    mock.configured = true;
    mock.invoke.mockResolvedValue({
      data: {
        ok: true,
        messageId: "m1",
        compliance: { flaggedKeywords: ["x"], severity: "unknown", modelScore: 0.7 },
      },
      error: null,
    });
    const r = await postChatMessageViaEdge({ threadId: "t", text: "hi", clientMsgId: "c" });
    expect(r).toEqual({
      ok: true,
      messageId: "m1",
      compliance: { flaggedKeywords: ["x"], severity: "low", modelScore: 0.7 },
    });
  });

  it("passes through a recognized high/medium severity and defaults missing keywords/score", async () => {
    mock.configured = true;
    mock.invoke.mockResolvedValue({
      data: {
        ok: true,
        messageId: "m2",
        compliance: { severity: "high" },
      },
      error: null,
    });
    const r = await postChatMessageViaEdge({ threadId: "t", text: "hi", clientMsgId: "c" });
    expect(r).toEqual({
      ok: true,
      messageId: "m2",
      compliance: { flaggedKeywords: [], severity: "high", modelScore: 0 },
    });
  });
});