import { registerAs } from '@nestjs/config';
import { MongoOptions, ServerApiVersion } from 'mongodb';

export default registerAs('mongodbConfig', () => ({
  uri: process.env.MONGODB_URI,
  useNewUrlParser: true,
  useUnifiedTopolgy: true,
  options: {
    dbName: process.env.MONGO_DB_NAME, // Make sure dbName is set here
    ...(process.env.NODE_ENV !== 'local'
      ? {
          ssl: true,
          sslValidate: true,
          sslCA: process.env.MONGO_SSL_CRT_PATH,
          tlsCertificateKeyFile: process.env.MONGO_SSL_CRT_PATH,
          serverApi: ServerApiVersion.v1,
        }
      : {}),
  } ,
}));
