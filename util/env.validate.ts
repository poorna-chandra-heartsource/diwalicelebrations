import { plainToInstance } from "class-transformer";
import { IsEnum, IsNumber, IsString, validateSync } from "class-validator";
import { isFloat32Array } from "util/types";

enum Environment {
    local = 'local',
    dev = 'dev',
    stage = 'stage',
    prod = 'prod'
}

enum Logger {
    info = 'info',
    error = 'error',
    debug = 'debug',
    log = 'log',
    warn = 'warn',
    verbose = 'verbose'
}

class EnvironmentVairables {
    @IsEnum(Environment)
    NODE_ENV: string;

    @IsString()
    APP_NAME: string;
  
    @IsString()
    APP_DESCRIPTION: string;
  
    @IsNumber()
    APP_PORT: number;
  
    @IsString()
    APP_HOST: string;
  
    @IsString()
    APP_BASE_URL: string;
  
    @IsString()
    APP_VERSION: string;
  
    @IsString()
    APP_SWAGGER_PATH: string;
  
    @IsString()
    CORS_ORIGIN: string;
  
    @IsString()
    CORS_CREDENTIALS: string;
  
    @IsString()
    CORS_EXPOSED_HEADERS: string;
  
    @IsString()
    MONGODB_URI: string;
  
    @IsString()
    MONGO_SSL_CRT_PATH: string;
  
    @IsEnum(Logger)
    LOGGER_LEVEL: string;
}

export function validate(config: Record<string, unknown>){
    const validateConfig = plainToInstance(EnvironmentVairables, config, {
        enableImplicitConversion: true
    });
    const errors = validateSync(validateConfig, { skipMissingProperties: false });
    if(errors.length > 0) throw new Error(errors.toString())
     console.log('Environment variables validated');
    return validateConfig;
}
