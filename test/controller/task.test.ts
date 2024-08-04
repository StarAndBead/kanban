import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';
import { TaskService } from '../../src/service/TaskService';
import { join } from 'path';
import { promises as fs } from 'fs';

describe('TaskController', () => {
    let app: Application;
    let taskService: TaskService;

    beforeAll(async () => {
        app = await createApp();
        taskService = await app.getApplicationContext().getAsync<TaskService>(TaskService);
    });

    afterAll(async () => {
        await close(app);
    });

    it('should create a task', async () => {
        const username = 'testuser';
        const projectId = 'project1';
        const status = 'open';
        const task = { id: 'task1', name: 'Task 1', details: 'Details of Task 1', status, attachment: 'file.txt', deadline: '2023-01-01', assignees: ['user1'] };
        jest.spyOn(taskService, 'createTask').mockResolvedValue(task);

        const result = await createHttpRequest(app)
            .post(`/api/${username}/projects/${projectId}/tasks/${status}`)
            .send(task);

        expect(result.status).toBe(200);
        expect(result.body).toEqual(task);
    });

    it('should update a task', async () => {
        const username = 'testuser';
        const projectId = 'project1';
        const taskId = 'task1';
        const task = { name: 'Updated Task', details: 'Updated details', status: 'in-progress', attachment: 'file.txt', deadline: '2023-02-01', assignees: ['user1'] };
        jest.spyOn(taskService, 'updateTask').mockResolvedValue(task);

        const result = await createHttpRequest(app)
            .put(`/api/${username}/projects/${projectId}/tasks/${taskId}`)
            .send(task);

        expect(result.status).toBe(200);
        expect(result.body).toEqual(task);
    });

    it('should delete a task', async () => {
        const username = 'testuser';
        const projectId = 'project1';
        const taskId = 'task1';
        jest.spyOn(taskService, 'deleteTask').mockResolvedValue(true);

        const result = await createHttpRequest(app)
            .del(`/api/${username}/projects/${projectId}/tasks/${taskId}`);

        expect(result.status).toBe(200);
        expect(result.body).toEqual(true);
    });

    it('should add a comment to a task', async () => {
        const username = 'testuser';
        const projectId = 'project1';
        const taskId = 'task1';
        const comment = 'This is a comment';
        jest.spyOn(taskService, 'addComment').mockResolvedValue(comment);

        const result = await createHttpRequest(app)
            .post(`/api/${username}/projects/${projectId}/tasks/${taskId}/comments`)
            .send({ comment });

        expect(result.status).toBe(200);
        expect(result.body).toEqual(comment);
    });

    it('should upload an attachment to a task', async () => {
        const username = 'testuser';
        const projectId = 'project1';
        const taskId = 'task1';
        const file = {
            filename: 'file.txt',
            data: Buffer.from('file content'),
        };
        const files = [file];
        const targetPath = join(__dirname, '../../uploads', taskId, file.filename);

        jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
        jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

        const result = await createHttpRequest(app)
            .post(`/api/${username}/projects/${projectId}/tasks/${taskId}/upload`)
            .attach('file', Buffer.from(file.data), file.filename);

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            filename: file.filename,
            url: `/uploads/${taskId}/${file.filename}`,
        });
    });

    it('should get attachments of a task', async () => {
        const username = 'testuser';
        const projectId = 'project1';
        const taskId = 'task1';
        const attachments = ['file1.txt', 'file2.txt'];
        jest.spyOn(taskService, 'getAttachments').mockResolvedValue(attachments);

        const result = await createHttpRequest(app)
            .get(`/api/${username}/projects/${projectId}/tasks/${taskId}/attachments`);

        expect(result.status).toBe(200);
        expect(result.body).toEqual(attachments);
    });
});
