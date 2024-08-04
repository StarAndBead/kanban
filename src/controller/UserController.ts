import { Controller, Post, Put, Param, Body, Inject, Provide } from '@midwayjs/decorator';
import { MyUserService as UserService } from '../service/UserService';

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

    @Put('/users/:username/change-password')
    async changePassword(@Param() username: any, @Body() body) {
        const { username: user_name } = username;
        const { oldPassword, newPassword } = body;
        const result = await this.userService.changePassword(user_name, oldPassword, newPassword);
        if (!result) {
            throw new Error('Failed to change password');
        }
        return { message: 'Password changed successfully' };
    }
}
