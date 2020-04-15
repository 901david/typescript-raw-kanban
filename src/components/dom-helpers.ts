export class DOMHelpers {
  findEl<T extends HTMLElement>(tag: string, ref?: T) {
    if (ref !== undefined) return ref.querySelector(tag)!;
    return document.querySelector(tag);
  }

  findAllEl<T extends HTMLElement>(tag: string, ref?: T) {
    if (ref !== undefined) return ref.querySelector(tag)!;
    return document.querySelectorAll(tag);
  }

  getById(id: string) {
    return document.getElementById(id);
  }

  getNode<T extends Node>(node: T, isDeep: boolean) {
    return document.importNode(node, isDeep);
  }

  configureListener<T extends HTMLElement>(
    el: T,
    eventType: string,
    handler: (event: any) => void
  ) {
    el.addEventListener(eventType, handler.bind(this));
  }

  empty<T extends HTMLElement>(element: T): void {
    element.innerHTML = "";
  }
}
