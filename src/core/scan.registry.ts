import { ScanDetector } from "./scan.types";
import { ScanError } from "./scan.error";

export class ScanRegistry {
  private readonly detectors = new Map<string, ScanDetector>();

  registerDetector(detector: ScanDetector): void {
    if (!detector.id) {
      throw new ScanError("Detector must have an id", "REGISTRY_ERROR");
    }
    this.detectors.set(detector.id, detector);
  }

  getDetector(id: string): ScanDetector {
    const detector = this.detectors.get(id);
    if (!detector) {
      throw new ScanError(`Detector not found: ${id}`, "REGISTRY_ERROR");
    }
    return detector;
  }

  listDetectors(): ScanDetector[] {
    return [...this.detectors.values()];
  }
}
