export class ScanInstance {
  constructor(private readonly name: string) {}

  getName(): string {
    return this.name;
  }

  isReady(): boolean {
    return true;
  }
}
