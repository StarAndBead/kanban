import { Project } from "./Project";
export class User {
    id: number;
    username: string;
    password: string;
    projects: Project[];
}