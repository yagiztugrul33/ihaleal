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
});