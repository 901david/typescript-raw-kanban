export type Listener<T> = (projects: T[]) => void;

export type UserInput = [string, string, number];

export type ValidationError = { error: string };

export enum ProjectStatus {
  Active,
  Inactive,
}
