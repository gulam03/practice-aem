import { EventEmitter } from '@stencil/core';

export interface HelixEvent {
  helixEvent: EventEmitter<HelixEventPayload>;
}

export class HelixEventPayload {
  name: string;
  path: string[];
  meta: unknown[];

  constructor(name?: string, path?: string[], meta?: unknown[]) {
    this.name = name;
    this.path = path;
    this.meta = meta;
  }
}

/**
 * Helper function for emitting HelixEvents
 *
 * Dispatches a CustomEvent called `helixEvent`
 * with an event.detail of type `HelixEventPayload`
 *
 * @param helixEvent - an instance of `EventEmitter<HelixEventPayload>`
 * @param eventName - the name of the event, such as `HelixInputFocus`
 * @param path - an array containing the names of elements that have modified the payloadMeta (ideally, it should at least contain the element which fired the event)
 * @param payloadMeta - an array (of objects) containing any data to be included in the event
 */

export const emitHelixEvent = (helixEvent: EventEmitter<HelixEventPayload>, eventName: string, path: string[] = [], payloadMeta: unknown[] = []): void => {
  const helixEventPayload = new HelixEventPayload(eventName, path, payloadMeta);
  helixEvent.emit(helixEventPayload);
};
