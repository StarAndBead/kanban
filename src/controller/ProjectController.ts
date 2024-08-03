import { Controller, Get, Post, Del, Put, Param, Body, Inject, Provide } from '@midwayjs/decorator';
import { ProjectService } from '../service/ProjectService';

@Provide()
@Controller('/api/:username/projects')
export class ProjectController {
    @Inject()
    projectService: ProjectService;

    @Get('/')
    async getProjects(@Param() params) {
        const { username } = params;
        return this.projectService.getProjects(username);
    }

    @Post('/:projectId/members')
    async addMember(@Param() params, @Body() body) {
        const { username, projectId } = params;
        const { username: memberUsername } = body;
        console.log(memberUsername);
        return this.projectService.addMember(username, projectId, memberUsername);
    }
    @Get('/:projectId/members')
    async getMembers(@Param() params) {
        const { username, projectId } = params;
        return this.projectService.getMembers(username, projectId);
    }
    @Post('/')
    async createProject(@Param() params, @Body() body) {
        const { username } = params;
        const { title } = body;
        return this.projectService.createProject(username, title);
    }

    @Del('/:projectId')
    async deleteProject(@Param() params) {
        const { username, projectId } = params;
        console.log(params);
        return this.projectService.deleteProject(username, projectId);
    }

    @Put('/:projectId')
    async toggleFavorite(@Param() params) {
        const { username, projectId } = params;
        return this.projectService.toggleFavorite(username, parseInt(projectId));
    }
}
