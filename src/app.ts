class DOMHelpers {
  static findEl(tag: string, ref?: HTMLElement) {
    if (ref !== undefined) return ref.querySelector(tag)!;
    return document.querySelector(tag);
  }

  static findAllEl(tag: string, ref?: HTMLElement) {
    if (ref !== undefined) return ref.querySelector(tag)!;
    return document.querySelectorAll(tag);
  }

  static getById(id: string) {
    return document.getElementById(id);
  }

  static getNode(node: Node, isDeep: boolean) {
    return document.importNode(node, isDeep);
  }

  static configureListener(
    el: Element,
    eventType: string,
    handler: (event: Event) => void
  ) {
    el.addEventListener(eventType, handler.bind(this));
  }
}

interface Validatable {
  value: string | number;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const AutoBind = (_: any, _2: any, propertyDescriptor: PropertyDescriptor) => {
  return {
    configurable: true,
    enumerable: true,
    get() {
      const origFN = propertyDescriptor.value;
      const boundFn = origFN.bind(this);
      return boundFn;
    },
  };
};

type UserInput = [string, string, number];

type ValidationError = { error: string };

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    const { getById, getNode, findEl, configureListener } = DOMHelpers;
    this.templateElement = <HTMLTemplateElement>getById("project-input")!;
    this.hostElement = <HTMLDivElement>getById("app")!;

    const importedNode = getNode(this.templateElement.content, true);
    this.element = (importedNode as any).firstElementChild;
    this.element.id = "user-input";
    this.titleInputEl = <HTMLInputElement>findEl("#title", this.element)!;
    this.descriptionInputEl = <HTMLInputElement>(
      findEl("#description", this.element)!
    );
    this.peopleInputEl = <HTMLInputElement>findEl("#people", this.element)!;
    configureListener(this.element, "submit", this._handleSubmit);

    this._attach();
  }

  private _isString(input: Validatable): boolean {
    return typeof input.value === "string";
  }

  private _isNumber(input: Validatable): boolean {
    return typeof input.value === "number";
  }

  private _isValid(userInput: Validatable[]) {
    return userInput.every((input) => {
      let isValid = true;
      if (input.isRequired !== undefined) {
        isValid = isValid && input.value.toString().length !== 0;
      }
      if (input.minLength !== undefined && this._isString(input)) {
        isValid = isValid && input.value.toString().length >= input.minLength;
      }
      if (input.maxLength !== undefined && this._isString(input)) {
        isValid = isValid && input.value.toString().length <= input.maxLength;
      }
      if (input.min !== undefined && this._isNumber(input)) {
        isValid = isValid && input.value >= input.min;
      }
      if (input.max !== undefined && this._isNumber(input)) {
        isValid = isValid && input.value <= input.max;
      }
      return isValid;
    });
  }

  private _gatherUserInput(): UserInput | ValidationError {
    const { value: description } = this.descriptionInputEl;
    const { value: title } = this.titleInputEl;
    const { value: people } = this.peopleInputEl;

    const titleValidatable: Validatable = {
      value: title,
      isRequired: true,
    };
    const peopleValidatable: Validatable = {
      value: +people,
      min: 1,
      max: 5,
      isRequired: true,
    };
    const descriptionValidatable: Validatable = {
      value: people,
      minLength: 1,
      maxLength: 300,
      isRequired: true,
    };

    if (
      this._isValid([
        titleValidatable,
        descriptionValidatable,
        peopleValidatable,
      ])
    )
      return [title, description, +people];
    alert("Error: Please fill out all fields");
    return { error: "Validation Failed" };
  }

  @AutoBind
  private _handleSubmit(event: Event): void {
    event.preventDefault();
    const userInput = this._gatherUserInput();
    console.log(userInput);
  }

  private _attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const input = new ProjectInput();
