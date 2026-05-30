import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildStoragePath,
  validateUploadFile,
  uploadFile,
  UploadUnavailableError,
} from "./uploadFile";

const mock = vi.hoisted(() => ({
  configured: false,
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
  createSignedUrl: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => mock.configured,
  supabase: {
    storage: {
      from: () => ({
        upload: mock.upload,
        getPublicUrl: mock.getPublicUrl,
        createSignedUrl: mock.createSignedUrl,
      }),
    },
  },
}));

describe("validateUploadFile", () => {
  it("accepts jpeg under size limit", () => {
    const file = new File([new Uint8Array(1024)], "photo.jpg", { type: "image/jpeg" });
    expect(validateUploadFile(file, "listing-photos")).toBeNull();
  });

  it("rejects oversized listing photo", () => {
    const file = new File([new Uint8Array(11 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
    expect(validateUploadFile(file, "listing-photos")).toMatch(/çok büyük/i);
  });
});

describe("buildStoragePath", () => {
  it("builds listing photo path with owner and entity", () => {
    const path = buildStoragePath(
      { bucket: "listing-photos", ownerId: "user-1", entityId: "listing-1" },
      "abc",
      "jpg",
    );
    expect(path).toBe("user-1/listing-1/abc.jpg");
  });

  it("strips path traversal from segments", () => {
    expect(() =>
      buildStoragePath(
        { bucket: "listing-photos", ownerId: "../evil", entityId: "listing-1" },
        "abc",
        "jpg",
      ),
    ).toThrow(/Geçersiz depolama/);
  });
});

describe("uploadFile", () => {
  beforeEach(() => {
    mock.configured = false;
    mock.upload.mockReset();
    mock.getPublicUrl.mockReset();
    mock.createSignedUrl.mockReset();
  });

  it("throws UploadUnavailableError when Supabase is off", async () => {
    mock.configured = false;
    const file = new File([new Uint8Array(8)], "a.jpg", { type: "image/jpeg" });
    await expect(
      uploadFile(file, { bucket: "listing-photos", ownerId: "u", entityId: "l" }),
    ).rejects.toBeInstanceOf(UploadUnavailableError);
  });
});
