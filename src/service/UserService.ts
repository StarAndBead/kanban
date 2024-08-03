import { Provide, Inject } from '@midwayjs/decorator';
import { promises as fs } from 'fs';
import { join } from 'path';
import { User } from '../entity/User';
import { JwtService } from '@midwayjs/jwt';

const USERS_FILE = join(__dirname, '../../data/users.json');

@Provide()
export class UserService {
    @Inject()
    jwtService: JwtService;

    async login(username: string, password: string) {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username && u.password == password);
        if (!user) {
            throw new Error('Invalid username or password');
        }
        const token = await this.jwtService.sign({ username });
        return { token, username };
    }

    async register(username: string, password: string) {
        const users = await this.readUsers();
        const existingUser = users.find(u => u.username == username);
        if (existingUser) {
            throw new Error('Username already exists');
        }
        const user = new User();
        user.id = Date.now();
        user.username = username;
        user.password = password;
        user.projects = [];
        users.push(user);
        await this.writeUsers(users);
        return { message: 'User registered successfully' };
    }



    async changePassword(username: string, oldPassword: string, newPassword: string): Promise<boolean> {
        const users = await this.readUsers();
        const user = users.find(u => u.username == username);
        console.log(users);
        console.log(username);
        if (user.password != oldPassword) {
            throw new Error('Old password is incorrect');
        }
        user.password = newPassword;
        await this.writeUsers(users);
        return true;
    }

    private async readUsers(): Promise<User[]> {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    }

    private async writeUsers(users: User[]): Promise<void> {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }
}
