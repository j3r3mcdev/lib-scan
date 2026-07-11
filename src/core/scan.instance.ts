import { ScanRegistry } from "./scan.registry";
import { ScanPipeline } from "./scan.pipeline";
import { ScanContextImpl } from "./scan.context";

export class ScanInstance {
  constructor(
    private readonly name: string,
    private readonly registry: ScanRegistry,
  ) {}

  getName() {
    return this.name;
  }

  run() {
    const context = new ScanContextImpl();
    const pipeline = new ScanPipeline(this.registry.listDetectors());
    return pipeline.run(context);
  }
}
