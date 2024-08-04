import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as jwt from '@midwayjs/jwt';
import * as upload from '@midwayjs/upload';
import * as crossDomain from '@midwayjs/cross-domain';

import { join } from 'path';
import { mkdirSync } from 'fs';
import { ReportMiddleware } from './middleware/report.middleware';

@Configuration({
  imports: [
    jwt,
    koa,
    validate,
    upload,
    crossDomain,
    {
      component: info,
      enabledEnvironment: ['local'],
    },

  ],
  importConfigs: [join(__dirname, './config')],

})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);

    // Ensure the upload directory exists
    const uploadDir = join(__dirname, '../uploads');
    mkdirSync(uploadDir, { recursive: true });
  }
}
