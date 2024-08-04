import { Provide } from '@midwayjs/decorator';
import { promises as fs } from 'fs';
import { join } from 'path';
import { User } from '../entity/User';
import { Project } from '../entity/Project';

const USERS_FILE = join(__dirname, '../data/users.json');

@Provide()
export class ProjectService {

    async getProjects(username: string) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        return user.projects;
    }

    async getFavProjects(username: string) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        return user.projects.filter(pro => pro.favorite == true);
    }

    async createProject(username: string, title: string) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        const project = new Project();
        project.id = Date.now();
        project.title = title;
        project.username = username;
        project.participants = [];
        project.participantsId = [];
        project['To do'] = [];
        project['In progress'] = [];
        project['Completed'] = [];
        user.projects.push(project);
        console.log(user);
        await this.writeUsers(users);
        return project;
    }

    async deleteProject(username: string, projectId: number) {
        const users = await this.readUsers();
        // console.log({ users });
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        //  console.log({ projectId });
        user.projects = user.projects.filter(p => p.id != projectId);
        //  console.log({ user });
        //  console.log("______________//////////");
        await this.writeUsers(users);
        //  const la_users = await this.readUsers();
        // console.log({ users });
        // const la_user = la_users.find(u => u.username === username);
        //  console.log({ la_user });
        // console.log({users});
        return { message: 'Project deleted successfully' };
    }

    async addMember(username: string, projectId: number, taskData: string) {//Task里需要增加成员也一起修改的部分
        const users = await this.readUsers();
        // console.log({ users });
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        const pro = user.projects.find(p => p.id == projectId);
        //console.log({ pro });
        pro.participants.push(taskData);
        const member = users.find(u => u.username == taskData);
        if (!member) {
            throw new Error('User not found');
        }
        pro.participantsId.push(member.id);
        member.projects.push(pro);
        member.projects.find(p => p.id == projectId).favorite = false;
        // console.log({ pro });
        await this.writeUsers(users);
        return { message: 'Member added successfully' };
    }

    async getMembers(username: string, projectId: number) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        const project = user.projects.find(p => p.id == projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        let res = project.participants;
        res.push(project.username + "(creator of the project)");
        console.log(res);
        return res;
    }

    async toggleFavorite(username: string, projectId: number) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        const project = user.projects.find(p => p.id == projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        project.favorite = !project.favorite;
        await this.writeUsers(users);
        return project;
    }



    private async readUsers(): Promise<User[]> {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    }

    private async writeUsers(users: User[]): Promise<void> {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }
}
