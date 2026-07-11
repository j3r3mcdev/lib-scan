import { describe, test, expect } from "vitest";
import { ScanError } from "../../../src/core/scan.error";

describe("ScanError static helpers", () => {
  test("ScanError.config sets correct code and context", () => {
    const err = ScanError.config("cfg", { stage: "init" });
    expect(err.code).toBe("CONFIG_ERROR");
    expect(err.context?.stage).toBe("init");
  });

  test("ScanError.pipeline sets correct code", () => {
    const err = ScanError.pipeline("pipe");
    expect(err.code).toBe("PIPELINE_ERROR");
  });

  test("ScanError.detector sets detectorId in context", () => {
    const err = ScanError.detector("det", "d1");
    expect(err.code).toBe("DETECTOR_ERROR");
    expect(err.context?.detectorId).toBe("d1");
  });

  test("ScanError.adapter sets adapterId in context", () => {
    const err = ScanError.adapter("adp", "a1");
    expect(err.code).toBe("ADAPTER_ERROR");
    expect(err.context?.adapterId).toBe("a1");
  });

  test("ScanError.registry sets correct code", () => {
    const err = ScanError.registry("reg");
    expect(err.code).toBe("REGISTRY_ERROR");
  });
});
