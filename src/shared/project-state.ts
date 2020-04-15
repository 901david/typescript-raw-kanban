import { ProjectStatus, Listener } from "./types";
import { Project } from "../models/project";

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

export class ProjectState extends State<Project> {
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

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this._projects.find(
      (project) => project.uniqueId === projectId
    );
    if (project !== undefined && project.status !== newStatus) {
      project.status = newStatus;
    }
    this.publish(this._projects.slice());
  }
}

export const projectState = ProjectState.getInstance();
