import { INestApplication, ValidationPipe } from "@nestjs/common";

export async function globalPipe(app: INestApplication): Promise<void> {
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,  // This ensures that plain objects are transformed into class instances
            whitelist: true,  // Remove properties not specified in the DTO
            forbidNonWhitelisted: true,  // Throw an error if unspecified properties are present
        }),
    );
}
