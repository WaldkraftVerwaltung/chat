export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'chat',
    user: process.env.DB_USER || 'chat',
    password: process.env.DB_PASSWORD || 'chat_dev_password',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
    expiresIn: '15m',
    refreshExpiresIn: '30d',
  },
  meilisearch: {
    url: process.env.MEILI_URL || 'http://localhost:7700',
    key: process.env.MEILI_KEY || 'dev-meili-key',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
    bucket: process.env.S3_BUCKET || 'chat-files',
  },
});
