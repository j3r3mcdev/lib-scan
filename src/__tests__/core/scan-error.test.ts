import { describe, test, expect } from "vitest";
import { ScanError } from "../../../src/core/scan.error";

describe("ScanError full constructor coverage", () => {
  test("constructor with full options", () => {
    const cause = new Error("root");
    const err = new ScanError("msg", "PIPELINE_ERROR", {
      context: { stage: "test" },
      cause,
    });

    expect(err.name).toBe("ScanError");
    expect(err.message).toBe("msg");
    expect(err.code).toBe("PIPELINE_ERROR");
    expect(err.context?.stage).toBe("test");
    expect(err.cause).toBe(cause);
  });

  test("constructor with empty options object", () => {
    const err = new ScanError("empty", "DETECTOR_ERROR", {});
    expect(err.code).toBe("DETECTOR_ERROR");
    expect(err.context).toBeUndefined();
    expect(err.cause).toBeUndefined();
  });

  test("constructor with options but only context", () => {
    const err = new ScanError("ctx-only", "REGISTRY_ERROR", {
      context: { detectorId: "d1" },
    });
    expect(err.context?.detectorId).toBe("d1");
    expect(err.cause).toBeUndefined();
  });

  test("constructor with options but only cause", () => {
    const cause = new Error("boom");
    const err = new ScanError("cause-only", "ADAPTER_ERROR", {
      cause,
    });
    expect(err.cause).toBe(cause);
    expect(err.context).toBeUndefined();
  });

  test("constructor without options", () => {
    const err = new ScanError("no-options");
    expect(err.code).toBe("PIPELINE_ERROR"); // default
    expect(err.context).toBeUndefined();
    expect(err.cause).toBeUndefined();
  });

  test("instanceof works thanks to setPrototypeOf", () => {
    const err = new ScanError("proto");
    expect(err instanceof ScanError).toBe(true);
  });
});
