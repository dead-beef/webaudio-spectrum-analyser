import { ActionDef } from '@ngxs/store/src/actions/symbols';

export class StoreAction<T> {
  public static readonly type: string;

  // eslint-disable-next-line require-jsdoc
  constructor(public payload: T) {}
}

export type StoreActionDef<T> = ActionDef<T, StoreAction<T>>;

export interface StoreActions {
  [key: string]: StoreActionDef<any>;
}

/**
 * Store action constructor.
 * @param actionScope action scope
 */
export const actionConstructor = (scope: string) => <T>(name: string) =>
  class {
    public static readonly type: string = `[${scope}]: ${name}`;

    // eslint-disable-next-line require-jsdoc
    constructor(public payload: T) {}
  } as StoreActionDef<T>;
