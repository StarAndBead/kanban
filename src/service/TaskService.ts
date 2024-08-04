import { Provide } from '@midwayjs/decorator';
import { promises as fs } from 'fs';
import { join } from 'path';
import { User } from '../entity/User';

import { Task } from '../entity/Task';

const USERS_FILE = join(__dirname, '../data/users.json');

@Provide()
export class TaskService {

    async createTask(username: string, projectId: number, status: string, taskData: any) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        const project = user.projects.find(p => p.id == projectId);
        if (!project) {
            console.log({ projectId });
            throw new Error('Project not found');
        }
        const task = new Task();
        Object.assign(task, taskData);
        task.id = Date.now();
        task.projectId = projectId;
        task.comments = [];
        project[status].push(task);

        const allMembers = [...project.participants, user.username];
        allMembers.forEach(memberUsername => {
            if (memberUsername != username) {
                const memberUser = users.find(u => u.username == memberUsername);
                if (memberUser) {
                    const projectIndex = memberUser.projects.findIndex(p => p.id == projectId);
                    let old_fav = memberUser.projects[projectIndex].favorite;
                    memberUser.projects[projectIndex] = project;
                    memberUser.projects[projectIndex].favorite = old_fav;
                }
            }
        });

        await this.writeUsers(users);
        return task;
    }

    async updateTask(username: string, projectId: number, taskId: number, name: string, targetstatus: string, attachment: any[], taskData: any) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        const project = user.projects.find(p => p.id == projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        // 先检查目标状态栏是否已经有该任务
        const task = project[targetstatus].find(t => t.id == taskId);
        if (task) {
            // 将task的comments和 projectId保留, 并将除了comments和 projectId的部分改为taskData
            const { comments, projectId, id } = task;
            Object.assign(task, taskData, { comments, projectId, id });
            //  task.attachment中加入attachment的所有元素
            if (attachment && attachment.length > 0) {
                task.attachment = [...(task.attachment || []), ...attachment];
            }
            const allMembers = [...project.participants, user.username];
            allMembers.forEach(memberUsername => {
                if (memberUsername != username) {
                    const memberUser = users.find(u => u.username == memberUsername);
                    if (memberUser) {
                        const projectIndex = memberUser.projects.findIndex(p => p.id == projectId);
                        let old_fav = memberUser.projects[projectIndex].favorite;
                        memberUser.projects[projectIndex] = project;
                        memberUser.projects[projectIndex].favorite = old_fav;
                    }
                }
            });

            await this.writeUsers(users);
            return task;
        } else {
            const temtask = project[targetstatus].find(t => t.name == name);
            if (temtask) {
                throw new Error('Task with the same name exists, please change the name first!');
            }
            // 遍历其他状态栏找到原来的任务
            const statuses = ['To do', 'In progress', 'Completed'].filter(status => status !== targetstatus);
            let originalTask;
            for (const status of statuses) {
                originalTask = project[status].find(t => t.id == taskId);
                if (originalTask) {
                    // 保留comments和projectId
                    const { comments, projectId, id } = originalTask;
                    // 删除原来的任务
                    console.log(originalTask);
                    project[status] = project[status].filter(t => t.id != taskId);
                    // 创建新的任务，保留comments和projectId
                    const newTask = { ...taskData, comments, projectId, id };
                    if (attachment && attachment.length > 0) {
                        newTask.attachment = [...(originalTask.attachment || []), ...attachment];
                    }
                    project[targetstatus].push(newTask);

                    const allMembers = [...project.participants, user.username];
                    allMembers.forEach(memberUsername => {
                        if (memberUsername != username) {
                            const memberUser = users.find(u => u.username == memberUsername);
                            if (memberUser) {
                                const projectIndex = memberUser.projects.findIndex(p => p.id == projectId);
                                let old_fav = memberUser.projects[projectIndex].favorite;
                                memberUser.projects[projectIndex] = project;
                                memberUser.projects[projectIndex].favorite = old_fav;
                            }
                        }
                    });
                    await this.writeUsers(users);
                    return newTask;
                }
            }
            throw new Error('Original task not found');
        }
    }

    async deleteTask(username: string, projectId: number, taskId: number) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        const project = user.projects.find(p => p.id == projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const statuses = ['To do', 'In progress', 'Completed'];
        for (const status of statuses) {
            project[status] = project[status].filter(t => t.id != taskId);
        }

        const allMembers = [...project.participants, user.username];
        allMembers.forEach(memberUsername => {
            if (memberUsername != username) {
                const memberUser = users.find(u => u.username == memberUsername);
                if (memberUser) {
                    const projectIndex = memberUser.projects.findIndex(p => p.id == projectId);
                    let old_fav = memberUser.projects[projectIndex].favorite;
                    memberUser.projects[projectIndex] = project;
                    memberUser.projects[projectIndex].favorite = old_fav;
                }
            }
        });

        await this.writeUsers(users);
        return { message: 'Task deleted successfully' };
    }

    async addComment(username: string, projectId: number, taskId: number, comment: string) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }
        const project = user.projects.find(p => p.id == projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const statuses = ['To do', 'In progress', 'Completed'];
        let task = null;
        for (const status of statuses) {
            task = project[status].find(t => t.id == taskId);
            if (task) break;  // 找到任务后退出循环
        }
        if (!task) {
            throw new Error('Task not found');
        }
        task.comments.push(username + ":" + comment);

        const allMembers = [...project.participants, user.username];
        allMembers.forEach(memberUsername => {
            if (memberUsername != username) {
                const memberUser = users.find(u => u.username == memberUsername);
                if (memberUser) {
                    const projectIndex = memberUser.projects.findIndex(p => p.id == projectId);
                    let old_fav = memberUser.projects[projectIndex].favorite;
                    memberUser.projects[projectIndex] = project;
                    memberUser.projects[projectIndex].favorite = old_fav;
                }
            }
        });

        await this.writeUsers(users);
        return task;
    }

    async uploadFiles(username: string, projectId: number, taskId: number, files: any) {
        const uploadDir = join(__dirname, '../../uploads', taskId.toString());
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        if (!user) {
            throw new Error('User not found');
        }

        const project = user.projects.find(p => p.id == projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        const savedFiles = [];
        let originalTask = null;
        for (const file of files) {
            const targetPath = join(uploadDir, `${file.filename}`);
            await fs.writeFile(targetPath, file.data);
            savedFiles.push({
                filename: file.filename,
                path: targetPath
            });

            const statuses = ['To do', 'In progress', 'Completed'];
            for (const status of statuses) {
                originalTask = [];
                originalTask = project[status].find(t => t.id == taskId);
                if (originalTask) {
                    // 保留comments和projectId
                    originalTask.attachment.push({
                        filename: file.filename,
                        path: targetPath
                    });

                    const allMembers = [...project.participants, user.username];
                    allMembers.forEach(memberUsername => {
                        if (memberUsername != username) {
                            const memberUser = users.find(u => u.username == memberUsername);
                            if (memberUser) {
                                const projectIndex = memberUser.projects.findIndex(p => p.id == projectId);
                                let oldFav = memberUser.projects[projectIndex].favorite;
                                memberUser.projects[projectIndex] = project;
                                memberUser.projects[projectIndex].favorite = oldFav;
                            }
                        }
                    });
                }
            }
        }
        await this.writeUsers(users);
        return originalTask.attachment;
    }

    async getAttachments(taskId: string) {
        const taskUploadDir = join(__dirname, '../../uploads', taskId);
        try {
            const files = await fs.readdir(taskUploadDir);
            console.log(files);
            return files.map((file) => ({
                filename: file,
                url: `/uploads/${taskId}/${file}`,
            }));
        } catch (error) {
            console.error('Error reading attachments:', error);
            throw new Error('Failed to get attachments');
        }
    }
    private async readUsers(): Promise<User[]> {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    }

    private async writeUsers(users: User[]): Promise<void> {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }
}
