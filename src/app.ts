class DOMHelpers {
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
    handler: (event: Event) => void
  ) {
    el.addEventListener(eventType, handler.bind(this));
  }

  empty<T extends HTMLElement>(element: T): void {
    element.innerHTML = "";
  }
}

enum ProjectStatus {
  Active,
  Inactive,
}

class Project {
  private _uniqueId: string = Math.random().toString();

  constructor(
    private _title: string,
    private _description: string,
    private _people: number,
    private _status: ProjectStatus
  ) {}

  get uniqueId(): string {
    return this._uniqueId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get people(): number {
    return this._people;
  }

  get status(): ProjectStatus.Active | ProjectStatus.Inactive {
    return this._status;
  }
}

type Listener<T> = (projects: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }

  protected publish(data: T[]) {
    this.listeners.forEach((listener) => {
      listener(data);
    });
  }
}

class ProjectState extends State<Project> {
  private _projects: Project[] = [];
  private static _instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this._instance) return this._instance;
    const instance = new ProjectState();
    return instance;
  }

  addProject(title: string, description: string, people: number) {
    this._projects.push(
      new Project(title, description, people, ProjectStatus.Active)
    );
    this.publish(this._projects.slice());
  }
}
const projectState = ProjectState.getInstance();

abstract class Component<
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

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  private _projectsToShow: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      this._projectsToShow = this._filterProjectsByStatus(projects);
      this._renderProjects();
    });
  }

  private _filterProjectsByStatus(projects: Project[]) {
    return projects.filter((project) => {
      if (this.type === "active")
        return project.status === ProjectStatus.Active;
      return project.status === ProjectStatus.Inactive;
    });
  }

  private _renderProjects() {
    const listEl = <HTMLUListElement>this.getById(`${this.type}-projects-list`);
    this.empty(listEl);
    this._projectsToShow.forEach((project) => {
      const listItem = document.createElement("li");
      listItem.textContent = project.title;
      listEl.appendChild(listItem);
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.findEl("ul", this.element)!.id = listId;
    this.findEl(
      "h2",
      this.element
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
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

    console.log(userInput);
  }
}

const input = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
