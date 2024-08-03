import { Controller, Post, Body, Inject, Provide } from '@midwayjs/decorator';
import { UserService } from '../service/UserService';

@Provide()
@Controller('/api')
export class UserController {
    @Inject()
    userService: UserService;

    @Post('/login')
    async login(@Body() body) {
        const { username, password } = body;
        return this.userService.login(username, password);
    }

    @Post('/register')
    async register(@Body() body) {
        const { username, password } = body;
        return this.userService.register(username, password);
    }
}
