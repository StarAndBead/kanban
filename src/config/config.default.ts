import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';
export default {
  keys: '1722435807101_9593',
  koa: {
    port: 3001,
  },
  jwt: {
    secret: 'your_jwt_secret', // secret key for JWT
    expiresIn: '2h', // token expiration time
  },
  upload: {
    mode: 'file',
    fileSize: '20mb',
    whitelist: null, // 允许所有类型文件
    tmpdir: join(__dirname, '../../uploads'), // 临时文件存储路径
    cleanTimeout: 5 * 60 * 1000, // 临时文件清理时间
    base64: false,
  },
  cors: {
    origin: "*"
  },
  static: {
    prefix: '/uploads', // URL 前缀
    dir: join(__dirname, '../../uploads'), // 静态文件目录
  },
} as MidwayConfig;