import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';
import { ProjectController } from '../../src/Controller/ProjectController';
import { ProjectService } from '../../src/service/ProjectService';

describe('ProjectController', () => {
    let app: Application;
    let projectService: ProjectService;

    beforeAll(async () => {
        app = await createApp();
        projectService = await app.getApplicationContext().getAsync<ProjectService>(ProjectService);
    });

    afterAll(async () => {
        await close(app);
    });

    it('should get projects', async () => {
        const username = 'testuser';
        jest.spyOn(projectService, 'getProjects').mockResolvedValue([]);

        const result = await createHttpRequest(app).get(`/api/${username}/projects`);
        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });

    it('should get favorite projects', async () => {
        const username = 'testuser';
        jest.spyOn(projectService, 'getFavProjects').mockResolvedValue([]);

        const result = await createHttpRequest(app).get(`/api/${username}/projects/favou`);
        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });

    it('should add a member', async () => {
        const username = 'testuser';
        const projectId = '1';
        const memberUsername = 'newMember';
        jest.spyOn(projectService, 'addMember').mockResolvedValue({});

        const result = await createHttpRequest(app)
            .post(`/api/${username}/projects/${projectId}/members`)
            .send({ username: memberUsername });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({});
    });

    it('should get members', async () => {
        const username = 'testuser';
        const projectId = '1';
        jest.spyOn(projectService, 'getMembers').mockResolvedValue([]);

        const result = await createHttpRequest(app).get(`/api/${username}/projects/${projectId}/members`);
        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });

    it('should create a project', async () => {
        const username = 'testuser';
        const title = 'New Project';
        jest.spyOn(projectService, 'createProject').mockResolvedValue({});

        const result = await createHttpRequest(app)
            .post(`/api/${username}/projects`)
            .send({ title });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({});
    });

    it('should delete a project', async () => {
        const username = 'testuser';
        const projectId = '1';
        jest.spyOn(projectService, 'deleteProject').mockResolvedValue({});

        const result = await createHttpRequest(app).del(`/api/${username}/projects/${projectId}`);
        expect(result.status).toBe(200);
        expect(result.body).toEqual({});
    });

    it('should toggle favorite', async () => {
        const username = 'testuser';
        const projectId = '1';
        jest.spyOn(projectService, 'toggleFavorite').mockResolvedValue({});

        const result = await createHttpRequest(app).put(`/api/${username}/projects/${projectId}`);
        expect(result.status).toBe(200);
        expect(result.body).toEqual({});
    });
});
