import { AnyScriptNode } from '../../interfaces';

export class WorkletNode {
  public static url: string = null;

  public static supported: boolean = null;

  public static types: string[] = ['White noise', 'Red noise'];

  public static processor = `
class WorkletProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: 'type',
      defaultValue: 0,
      minValue: 0,
      maxValue: 10,
      automationRate: 'k-rate'
    }];
  }

  process(inputs, outputs, parameters) {
    try {
      generate(outputs[0], parameters);
    } catch(err) {
      console.error(err);
      return false;
    }
    return true;
  }
}
registerProcessor('worklet-processor', WorkletProcessor);`;

  /* eslint-disable no-var,@typescript-eslint/no-unsafe-member-access */
  /**
   * TODO: description
   */
  public static generate = function generate(output, parameters) {
    var type_ = parameters['type'];
    if (type_[0] !== undefined) {
      type_ = type_[0];
    } else if (type_.value !== undefined) {
      type_ = type_.value;
    }
    output.forEach(function (channel, idx) {
      if (type_ < 1) {
        for (var i = 0; i < channel.length; ++i) {
          channel[i] = Math.random() * 2 - 1;
        }
      } else if (type_ < 2) {
        var value = channel[channel.length - 1] || 0;
        for (var i = 0; i < channel.length; ++i) {
          var white = Math.random() * 2 - 1;
          value = 0.95 * value + 0.05 * white;
          channel[i] = value;
        }
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
        value: {
          type: { value: 0 },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          get: (name: string) => node['parameters'][name],
        },
        writable: false,
        enumerable: true,
      });
      node.onaudioprocess = (ev: AudioProcessingEvent) => {
        const output = [];
        for (let i = 0; i < ev.outputBuffer.numberOfChannels; ++i) {
          output.push(ev.outputBuffer.getChannelData(i));
        }
        WorkletNode.generate(output, node['parameters']);
      };
      return node as any;
    }

    // eslint-disable-next-line compat/compat
    const node = new AudioWorkletNode(ctx, 'worklet-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
    });
    node.onprocessorerror = err => console.error(err);
    return node as any;
  }
}
