"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class DOMHelpers {
    static findEl(tag, ref) {
        if (ref !== undefined)
            return ref.querySelector(tag);
        return document.querySelector(tag);
    }
    static findAllEl(tag, ref) {
        if (ref !== undefined)
            return ref.querySelector(tag);
        return document.querySelectorAll(tag);
    }
    static getById(id) {
        return document.getElementById(id);
    }
    static getNode(node, isDeep) {
        return document.importNode(node, isDeep);
    }
    static configureListener(el, eventType, handler) {
        el.addEventListener(eventType, handler.bind(this));
    }
}
class ProjectState {
    constructor() {
        this._projects = [];
        this._listeners = [];
    }
    static getInstance() {
        if (this._instance)
            return this._instance;
        const instance = new ProjectState();
        return instance;
    }
    addProject(title, description, people) {
        this._projects.push(new Project(title, description, people));
        this._publish();
    }
    addListener(handler) {
        this._listeners.push(handler);
    }
    _publish() {
        this._listeners.forEach((listener) => {
            listener(this._projects.slice());
        });
    }
}
const projectState = ProjectState.getInstance();
class Project {
    constructor(_title, _description, _people) {
        this._title = _title;
        this._description = _description;
        this._people = _people;
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
}
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
class ProjectList {
    constructor(type) {
        this.type = type;
        this._assignedProjects = [];
        const { getById, getNode } = DOMHelpers;
        this.templateElement = getById("project-list");
        this.hostElement = getById("app");
        const importedNode = getNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        projectState.addListener((projects) => {
            this._assignedProjects = projects;
            this._renderProjects();
        });
        this._attach();
        this._renderContent();
    }
    _renderProjects() {
        const { getById } = DOMHelpers;
        const listEl = getById(`${this.type}-projects-list`);
        this._assignedProjects.forEach((project) => {
            const listItem = document.createElement("li");
            listItem.textContent = project.title;
            listEl.appendChild(listItem);
        });
    }
    _renderContent() {
        const { findEl } = DOMHelpers;
        const listId = `${this.type}-projects-list`;
        findEl("ul", this.element).id = listId;
        findEl("h2", this.element).textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    _attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    }
}
class ProjectInput {
    constructor() {
        const { getById, getNode, findEl, configureListener } = DOMHelpers;
        this.templateElement = getById("project-input");
        this.hostElement = getById("app");
        const importedNode = getNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = "user-input";
        this.titleInputEl = findEl("#title", this.element);
        this.descriptionInputEl = (findEl("#description", this.element));
        this.peopleInputEl = findEl("#people", this.element);
        configureListener(this.element, "submit", this._handleSubmit);
        this._attach();
    }
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
        console.log(userInput);
    }
    _attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "_handleSubmit", null);
const input = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
//# sourceMappingURL=app.js.map