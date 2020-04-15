import { DragTarget } from "../shared/interfaces";
import { Component } from "./base-component";
import { Project } from "../models/project";
import { projectState } from "../shared/project-state";
import { ProjectStatus } from "../shared/types";
import { ProjectItem } from "./project-item";

export class ProjectList extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  private _projectsToShow: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.configure();
    this.renderContent();
  }

  configure() {
    this.configureListener(this.element, "dragover", this.dragOverHandler);
    this.configureListener(this.element, "dragleave", this.dragLeaveHandler);
    this.configureListener(this.element, "drop", this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      this._projectsToShow = this._filterProjectsByStatus(projects);
      this._renderProjects();
    });
  }

  dragOverHandler(event: DragEvent): void {
    const isTextPlain = event.dataTransfer!.types[0] === "text/plain";
    if (isTextPlain) {
      event.preventDefault();
      const listEl = this.findEl("ul", this.element)!;
      listEl.classList.add("droppable");
    }
  }

  dropHandler(event: DragEvent): void {
    const id = event.dataTransfer!.getData("text/plain");
    const newStatus =
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Inactive;
    projectState.moveProject(id, newStatus);
  }

  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.findEl("ul", this.element)!;
    listEl.classList.remove("droppable");
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
      new ProjectItem(this.findEl("ul", this.element)!.id, project);
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
