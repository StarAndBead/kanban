import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: '1722435807101_9593',
  koa: {
    port: 3001,
  },
  jwt: {
    secret: 'your_jwt_secret', // secret key for JWT
    expiresIn: '2h', // token expiration time
  },
} as MidwayConfig;