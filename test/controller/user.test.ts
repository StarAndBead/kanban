import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';
import { MyUserService as UserService } from '../../src/service/UserService';

describe('UserController', () => {
    let app: Application;
    let userService: UserService;

    beforeAll(async () => {
        app = await createApp();
        userService = await app.getApplicationContext().getAsync<UserService>(UserService);
    });

    afterAll(async () => {
        await close(app);
    });

    it('should login', async () => {
        const username = 'testuser';
        const password = 'password123';
        jest.spyOn(userService, 'login').mockResolvedValue({ token: 'fake-token' });

        const result = await createHttpRequest(app)
            .post('/api/login')
            .send({ username, password });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({ token: 'fake-token' });
    });

    it('should register', async () => {
        const username = 'newuser';
        const password = 'password123';
        jest.spyOn(userService, 'register').mockResolvedValue({ id: 1 });

        const result = await createHttpRequest(app)
            .post('/api/register')
            .send({ username, password });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({ id: 1 });
    });

    it('should change password', async () => {
        const username = 'testuser';
        const oldPassword = 'oldpassword';
        const newPassword = 'newpassword';
        jest.spyOn(userService, 'changePassword').mockResolvedValue(true);

        const result = await createHttpRequest(app)
            .put(`/api/users/${username}/change-password`)
            .send({ oldPassword, newPassword });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({ message: 'Password changed successfully' });
    });

    it('should fail to change password with incorrect details', async () => {
        const username = 'testuser';
        const oldPassword = 'wrongpassword';
        const newPassword = 'newpassword';
        jest.spyOn(userService, 'changePassword').mockResolvedValue(false);

        const result = await createHttpRequest(app)
            .put(`/api/users/${username}/change-password`)
            .send({ oldPassword, newPassword });

        expect(result.status).toBe(500);
        expect(result.body).toEqual({ message: 'Failed to change password' });
    });
});
