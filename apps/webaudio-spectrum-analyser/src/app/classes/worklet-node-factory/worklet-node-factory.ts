import { AnyScriptNode } from '../../interfaces';
import { WorkletProcessorConstructor } from '../worklet-processor';

export class WorkletNodeFactory {
  public readonly url: Record<string, string> = {};

  public readonly registered: Record<string, boolean> = {};

  public readonly supported: boolean;

  /**
   * Constructor.
   */
  constructor(public readonly context: AudioContext) {
    this.supported =
      typeof context?.audioWorklet?.addModule !== 'undefined' &&
      typeof AudioWorkletNode !== 'undefined';
  }

  /**
   * TODO: description
   */
  public getUrl(processor: WorkletProcessorConstructor): string {
    if (Object.prototype.hasOwnProperty.call(this.url, processor.key)) {
      return this.url[processor.key];
    }

    const classSource = String(processor).replace(
      /\b(class\s+\S+)[^{]+\{/,
      '$1 extends AudioWorkletProcessor {'
    );
    const source = `${classSource}
registerProcessor(${JSON.stringify(processor.key)}, ${processor.name});`;
    //console.log('worklet source', source);
    const blob = new Blob([source], {
      type: 'text/javascript',
    });
    const url = URL.createObjectURL(blob);
    this.url[processor.key] = url;
    return url;
  }

  /**
   * TODO: description
   */
  public isRegistered(processor: WorkletProcessorConstructor): boolean {
    return Object.prototype.hasOwnProperty.call(this.registered, processor.key);
  }

  /**
   * TODO: description
   */
  public async register(processor: WorkletProcessorConstructor): Promise<void> {
    //console.log('register worklet');
    if (!this.supported) {
      throw new Error('AudioWorkletNode is not supported');
      /*console.warn('AudioWorkletNode is not supported');
      console.warn('using ScriptProcessorNode');
      return;*/
    }
    await this.context.audioWorklet.addModule(this.getUrl(processor));
    this.registered[processor.key] = true;
  }

  /**
   * TODO: description
   */
  public async create(
    processor: WorkletProcessorConstructor
  ): Promise<AnyScriptNode> {
    if (!this.isRegistered(processor)) {
      await this.register(processor);
    }

    if (!this.supported) {
      throw new Error('AudioWorkletNode is not supported');
      /*console.log('create script processor');
      const node = context.createScriptProcessor(4096, 0, 2);
      console.log('create script processor parameters');
      Object.defineProperty(node, 'parameters', {
        value: {
          type: { value: 0 },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          get: (name: string) => node['parameters'][name],
        },
        writable: false,
        enumerable: true,
      });
      console.log('create script processor onaudioprocess');
      node.onaudioprocess = (ev: AudioProcessingEvent) => {
        const output: Float32Array[] = [];
        for (let i = 0; i < ev.outputBuffer.numberOfChannels; ++i) {
          output.push(ev.outputBuffer.getChannelData(i));
        }
        WorkletNode.generate(output, node['parameters']);
      };
      console.log('created script processor');
      return node as any;*/
    }

    //console.log('create workletnode');
    // eslint-disable-next-line compat/compat
    const node = new AudioWorkletNode(this.context, processor.key, {
      numberOfInputs: processor.inputs,
      numberOfOutputs: processor.outputs,
    });
    //console.log('create workletnode onprocessorerror');
    node.onprocessorerror = err => console.error(err);
    //console.log('created workletnode');
    return node as any;
  }
}
