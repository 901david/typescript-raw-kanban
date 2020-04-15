import { DOMHelpers } from "./dom-helpers";

export abstract class Component<
  T extends HTMLElement,
  U extends HTMLElement
> extends DOMHelpers {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    templateId: string,
    hostElementId: string,
    private insertAtBeginning: boolean,
    newElementId?: string
  ) {
    super();
    this.templateElement = <HTMLTemplateElement>this.getById(templateId)!;
    this.hostElement = <T>this.getById(hostElementId)!;

    const importedNode = this.getNode(this.templateElement.content, true);
    this.element = <U>(importedNode as any).firstElementChild;
    if (newElementId) this.element.id = newElementId;

    this.attach();
  }

  protected attach() {
    this.hostElement.insertAdjacentElement(
      this.insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}
