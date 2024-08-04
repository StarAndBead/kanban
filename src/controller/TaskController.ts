import { Controller, Post, Put, Del, Param, Body, Inject, Provide, Files, Get } from '@midwayjs/decorator';
import { TaskService } from '../service/TaskService';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller('/api/:username/projects/:projectId/tasks')
export class TaskController {
    @Inject()
    taskService: TaskService;

    @Inject()
    ctx: Context;

    @Post('/:status')
    async createTask(@Param() params, @Body() body) {
        const { username, projectId } = params;
        const { id, name, details, status, attachment, deadline, assignees } = body;
        return this.taskService.createTask(username, projectId, status, { id, name, details, status, attachment, deadline, assignees });
    }

    @Put('/:taskId')
    async updateTask(@Param() params, @Body() body) {
        const { username, projectId, taskId } = params;
        const { name, details, status, attachment, deadline, assignees } = body;
        return this.taskService.updateTask(username, projectId, taskId, name, status, attachment, { name, details, status, deadline, assignees });
    }

    @Del('/:taskId')
    async deleteTask(@Param() params) {
        const { username, projectId, taskId } = params;
        return this.taskService.deleteTask(username, projectId, taskId);
    }

    @Post('/:taskId/comments')
    async addComment(@Param() params, @Body() body) {
        const { username, projectId, taskId } = params;
        const { comment } = body;
        return this.taskService.addComment(username, projectId, taskId, comment);
    }

    @Post('/:taskId/upload')
    async uploadAttachment(@Param() params, @Files() files) {
        const { taskId } = params;
        const file = files[0];
        console.log(files);
        const targetPath = join(__dirname, '../../uploads', taskId, file.filename);

        try {
            await fs.mkdir(join(__dirname, '../../uploads', taskId), { recursive: true });
            await fs.writeFile(targetPath, file.data);
            return {
                filename: file.filename,
                url: `/uploads/${taskId}/${file.filename}`,
            };
        } catch (error) {
            console.error('File upload error:', error);
            throw new Error('Failed to upload file');
        }
    }

    @Get('/:taskId/attachments/:fileName')
    async downloadAttachment(
        @Param('username') username: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Param('fileName') fileName: string
    ) {
        const filePath = join(__dirname, '../../uploads', taskId, fileName);

        try {
            const fileExists = await fs.access(filePath).then(() => true).catch(() => false);

            if (!fileExists) {
                this.ctx.status = 404;
                this.ctx.body = 'File not found';
                return;
            }

            const encodedFileName = encodeURIComponent(fileName);

            this.ctx.set('Content-Disposition', `attachment; filename="${encodedFileName}"`);
            this.ctx.type = fileName.split('.').pop(); // Set the content type based on file extension
            this.ctx.body = await fs.readFile(filePath);
        } catch (error) {
            console.error('Error downloading file:', error);
            this.ctx.status = 500;
            this.ctx.body = 'Failed to download file';
        }
    }
}
