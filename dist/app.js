"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Inactive"] = 1] = "Inactive";
})(ProjectStatus || (ProjectStatus = {}));
const AutoBind = (_, _2, propertyDescriptor) => {
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
class DOMHelpers {
    findEl(tag, ref) {
        if (ref !== undefined)
            return ref.querySelector(tag);
        return document.querySelector(tag);
    }
    findAllEl(tag, ref) {
        if (ref !== undefined)
            return ref.querySelector(tag);
        return document.querySelectorAll(tag);
    }
    getById(id) {
        return document.getElementById(id);
    }
    getNode(node, isDeep) {
        return document.importNode(node, isDeep);
    }
    configureListener(el, eventType, handler) {
        el.addEventListener(eventType, handler.bind(this));
    }
    empty(element) {
        element.innerHTML = "";
    }
}
class Component extends DOMHelpers {
    constructor(templateId, hostElementId, insertAtBeginning, newElementId) {
        super();
        this.insertAtBeginning = insertAtBeginning;
        this.templateElement = this.getById(templateId);
        this.hostElement = this.getById(hostElementId);
        const importedNode = this.getNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId)
            this.element.id = newElementId;
        this.attach();
    }
    attach() {
        this.hostElement.insertAdjacentElement(this.insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
}
class Project {
    constructor(_title, _description, _people, _status) {
        this._title = _title;
        this._description = _description;
        this._people = _people;
        this._status = _status;
        this._uniqueId = Math.random().toString();
    }
    get uniqueId() {
        return this._uniqueId;
    }
    get title() {
        return this._title;
    }
    get description() {
        return this._description;
    }
    get people() {
        return this._people;
    }
    get status() {
        return this._status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    publish(data) {
        this.listeners.forEach((listener) => {
            listener(data);
        });
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this._projects = [];
    }
    static getInstance() {
        if (this._instance)
            return this._instance;
        const instance = new ProjectState();
        return instance;
    }
    addProject(title, description, people) {
        this._projects.push(new Project(title, description, people, ProjectStatus.Active));
        this.publish(this._projects.slice());
    }
}
class ProjectItem extends Component {
    constructor(hostId, _project) {
        super("single-project", hostId, false, _project.uniqueId);
        this._project = _project;
        this.configure();
        this.renderContent();
    }
    configure() { }
    renderContent() {
        this.findEl("h2", this.element).textContent = this._project.title;
        this.findEl("h3", this.element).textContent = this.peopleText;
        this.findEl("p", this.element).textContent = this._project.description;
    }
    get peopleText() {
        const { people: numPeople } = this._project;
        return `${numPeople} Person${numPeople !== 1 ? "s" : ""} Assigned`;
    }
}
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this._projectsToShow = [];
        this.configure();
        this.renderContent();
    }
    configure() {
        projectState.addListener((projects) => {
            this._projectsToShow = this._filterProjectsByStatus(projects);
            this._renderProjects();
        });
    }
    _filterProjectsByStatus(projects) {
        return projects.filter((project) => {
            if (this.type === "active")
                return project.status === ProjectStatus.Active;
            return project.status === ProjectStatus.Inactive;
        });
    }
    _renderProjects() {
        const listEl = this.getById(`${this.type}-projects-list`);
        this.empty(listEl);
        this._projectsToShow.forEach((project) => {
            new ProjectItem(this.findEl("ul", this.element).id, project);
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.findEl("ul", this.element).id = listId;
        this.findEl("h2", this.element).textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
}
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, `user-input`);
        this.configure();
    }
    configure() {
        this.titleInputEl = this.findEl("#title", this.element);
        this.descriptionInputEl = (this.findEl("#description", this.element));
        this.peopleInputEl = (this.findEl("#people", this.element));
        this.configureListener(this.element, "submit", this._handleSubmit);
    }
    renderContent() { }
    _isString(input) {
        return typeof input.value === "string";
    }
    _isNumber(input) {
        return typeof input.value === "number";
    }
    _isValid(userInput) {
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
    _gatherUserInput() {
        const { value: description } = this.descriptionInputEl;
        const { value: title } = this.titleInputEl;
        const { value: people } = this.peopleInputEl;
        const titleValidatable = {
            value: title,
            isRequired: true,
        };
        const peopleValidatable = {
            value: +people,
            min: 1,
            max: 5,
            isRequired: true,
        };
        const descriptionValidatable = {
            value: people,
            minLength: 1,
            maxLength: 300,
            isRequired: true,
        };
        if (this._isValid([
            titleValidatable,
            descriptionValidatable,
            peopleValidatable,
        ]))
            return [title, description, +people];
        alert("Error: Please fill out all fields");
        return { error: "Validation Failed" };
    }
    _handleSubmit(event) {
        event.preventDefault();
        const userInput = this._gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
        }
    }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "_handleSubmit", null);
const projectState = ProjectState.getInstance();
const input = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
//# sourceMappingURL=app.js.map