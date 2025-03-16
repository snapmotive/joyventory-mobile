declare module 'quagga' {
  interface QuaggaResult {
    codeResult: {
      code: string;
      format: string;
    };
  }

  interface QuaggaConfig {
    inputStream: {
      name: string;
      type: string;
      target: HTMLElement;
      constraints?: {
        facingMode: string;
      };
    };
    decoder: {
      readers: string[];
    };
    locate: boolean;
    frequency: number;
  }

  interface QuaggaStatic {
    init(config: QuaggaConfig): Promise<void>;
    start(): void;
    stop(): void;
    onDetected(callback: (result: QuaggaResult) => void): void;
  }

  const Quagga: QuaggaStatic;
  export default Quagga;
} 