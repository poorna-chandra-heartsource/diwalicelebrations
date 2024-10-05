import { INestApplication } from "@nestjs/common";
import helmet from "helmet";

export async function securityMiddleware(app: INestApplication): Promise<void> {
    app.use(helmet());
}
