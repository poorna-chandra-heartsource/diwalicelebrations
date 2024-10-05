import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import swaggerConfig from "src/config/swagger.config";

export async function swaggerSetUp(app: INestApplication): Promise<void> {
    const openApiConfig = new DocumentBuilder()
    .setTitle(swaggerConfig().title)
    .setDescription(swaggerConfig().description)
    .setVersion(swaggerConfig().version)
    .build()

    const document = SwaggerModule.createDocument(app, openApiConfig);
    SwaggerModule.setup(swaggerConfig().swaggerPath, app, document)
}
