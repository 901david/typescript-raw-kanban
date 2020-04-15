import { ProjectStatus } from "../shared/types";

export class Project {
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

  set status(status: ProjectStatus) {
    this._status = status;
  }
}
