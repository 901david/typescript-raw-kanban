import { Component } from "./base-component";
import { Draggable } from "../shared/interfaces";
import { Project } from "../models/project";

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  constructor(hostId: string, private _project: Project) {
    super("single-project", hostId, false, _project.uniqueId);
    this.configure();
    this.renderContent();
  }
  configure() {
    this.configureListener(this.element, "dragstart", this.dragStartHandler);
    this.configureListener(this.element, "dragend", this.dragEndHandler);
  }

  renderContent() {
    this.findEl("h2", this.element)!.textContent = this._project.title;
    this.findEl("h3", this.element)!.textContent = this.peopleText;
    this.findEl("p", this.element)!.textContent = this._project.description;
  }

  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this._project.uniqueId);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(event: DragEvent) {
    console.log("Drag End", event);
  }

  get peopleText(): string {
    const { people: numPeople } = this._project;
    return `${numPeople} Person${numPeople !== 1 ? "s" : ""} Assigned`;
  }
}
