import { ScanRegistry } from "./scan.registry.js";
import { ScanPipeline } from "./scan.pipeline.js";
import { ScanContextImpl } from "./scan.context.js";

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
