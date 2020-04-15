import { Component } from "./base-component";
import { Validatable } from "../shared/interfaces";
import { UserInput, ValidationError } from "../shared/types";
import { AutoBind } from "../decorators/auto-bind";
import { projectState } from "../shared/project-state";

export class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
  titleInputEl!: HTMLInputElement;
  descriptionInputEl!: HTMLInputElement;
  peopleInputEl!: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, `user-input`);
    this.configure();
  }

  configure() {
    this.titleInputEl = <HTMLInputElement>this.findEl("#title", this.element)!;
    this.descriptionInputEl = <HTMLInputElement>(
      this.findEl("#description", this.element)!
    );
    this.peopleInputEl = <HTMLInputElement>(
      this.findEl("#people", this.element)!
    );
    this.configureListener(this.element, "submit", this._handleSubmit);
  }

  renderContent() {}

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
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
    }
  }
}
