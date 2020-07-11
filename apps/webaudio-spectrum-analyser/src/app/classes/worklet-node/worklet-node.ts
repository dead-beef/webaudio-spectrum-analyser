import { AnyScriptNode } from '../../interfaces';

export class WorkletNode {
  public static url: string = null;

  public static supported: boolean = null;

  public static processor = `
class WorkletProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    try {
      generate(outputs[0], parameters);
    } catch(err) {}
    return true;
  }
}
registerProcessor('worklet-processor', WorkletProcessor);`;

  /* eslint-disable no-var,@typescript-eslint/no-unsafe-member-access */
  /**
   * TODO: description
   */
  public static generate = function generate(output, parameters) {
    output.forEach(function (channel) {
      for (var i = 0; i < channel.length; ++i) {
        channel[i] = Math.random() * 2 - 1;
      }
    });
  };
  /* eslint-enable no-var,@typescript-eslint/no-unsafe-member-access */

  /**
   * TODO: description
   */
  public static isSupported(ctx?: AudioContext): boolean {
    if (WorkletNode.supported === null) {
      WorkletNode.supported =
        (!ctx || ctx?.audioWorklet?.addModule !== undefined) &&
        typeof AudioWorkletNode !== 'undefined';
    }
    return WorkletNode.supported;
  }

  /**
   * TODO: description
   */
  public static getUrl(): string {
    if (WorkletNode.url === null) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const source = String(WorkletNode.generate).concat(
        '\n',
        WorkletNode.processor
      );
      //console.log('worklet source', source);
      const blob = new Blob([source], {
        type: 'text/javascript',
      });
      WorkletNode.url = URL.createObjectURL(blob);
    }
    return WorkletNode.url;
  }

  /**
   * TODO: description
   * @param ctx
   */
  public static register(ctx: AudioContext): Promise<void> {
    if (!WorkletNode.isSupported(ctx)) {
      //return Promise.reject(new Error('AudioWorkletNode is not supported'));
      console.warn('AudioWorkletNode is not supported');
      console.warn('using ScriptProcessorNode');
      return Promise.resolve();
    }
    return ctx.audioWorklet.addModule(WorkletNode.getUrl());
  }

  /**
   * TODO: description
   * @param ctx
   */
  public static create(ctx: AudioContext): AnyScriptNode {
    if (!WorkletNode.isSupported(ctx)) {
      //throw new Error('AudioWorkletNode is not supported');
      const node = ctx.createScriptProcessor(4096, 0, 2);
      Object.defineProperty(node, 'parameters', {
        value: {},
        writable: false,
        enumerable: true,
      });
      node.onaudioprocess = (ev: AudioProcessingEvent) => {
        const output = [];
        for (let i = 0; i < ev.outputBuffer.numberOfChannels; ++i) {
          output.push(ev.outputBuffer.getChannelData(i));
        }
        WorkletNode.generate(output, {});
      };
      return node as any;
    }

    // eslint-disable-next-line compat/compat
    return new AudioWorkletNode(ctx, 'worklet-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
    });
  }
}
