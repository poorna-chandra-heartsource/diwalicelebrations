import { INestApplication, NestMiddleware } from "@nestjs/common";
const xss = require('xss');

export class XssMiddleware implements NestMiddleware {
    use(req: any, res: any, next: (error?: Error | any) => void) {
        // Sanitize the request body
        req.body = this.sanitizeObject(req.body);

        // Sanitize the query params
        req.query = this.sanitizeObject(req.query);

        // Sanitize URL params
        req.params = this.sanitizeObject(req.params);

        next();
    }

    private sanitizeObject(obj: any): any {
        if (typeof obj === 'string') {
          return xss(obj);  // Sanitize strings
        }
    
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              obj[key] = this.sanitizeObject(obj[key]);  // Recursively sanitize objects
            }
          }
        }
        return obj;
      }
    
}
