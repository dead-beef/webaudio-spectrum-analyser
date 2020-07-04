import { ActionDef } from '@ngxs/store/src/actions/symbols';

export interface IActionPayload<T = void> {
  payload: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class BaseStoreAction<
  T extends IActionPayload<any> = { payload: void }
> {
  public static readonly type: string;

  // eslint-disable-next-line require-jsdoc
  constructor(public payload: T['payload']) {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoreAction<
  T extends IActionPayload<any> = { payload: void }
> = BaseStoreAction<T>;

/**
 * Store action constructor.
 * @param actionScope action scope
 */
export const actionConstructor = (actionScope: string) => <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends IActionPayload<any> = { payload: void }
>(
  actionName: string
) =>
  class extends BaseStoreAction<T> {
    public static readonly type: string = `[${actionScope}]: ${actionName}`;

    // eslint-disable-next-line require-jsdoc
    constructor(public payload: T['payload']) {
      super(payload);
    }
  } as ActionDef<T['payload'], StoreAction<T>>;

export type EmptyPayload = IActionPayload<null>;
