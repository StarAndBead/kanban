import { Task } from "./Task";
export class Project {
    id: number;
    title: string;
    username: string;
    'To do': Task[];
    'In progress': Task[];
    'Completed': Task[];
    participants: string[];
    participantsId: number[];
    favorite: boolean;
}