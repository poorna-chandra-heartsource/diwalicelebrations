import xss, { filterXSS } from 'xss';
import * as crypto from 'crypto';
import appConfig from 'src/config/app.config';

 /**
 * Transform strings in provided JSON using provided function.
 * Input can be string, array of string, JSON with string properties ans so on
 */
export function modify(val: any, func: (arg: any) => void): any {
  if (!val) {
    return val;
  }

  if (typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }

  if (typeof val === 'string') {
    return func(val);
  }

  if (typeof val === 'object') {
    return Array.isArray(val)
      ? val.map((item) => modify(item, func))
      : Object.keys(val).reduce((prev: any, curr: any) => {
          prev[curr] = modify(val[curr], func);
          return prev;
        }, {});
  }
}

export function sanitize<T>(val: T): T {
  return modify(val, (value) => {
    filterXSS(value, {
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  });
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitizedObject: Record<string, any> = {};
  console.log('sanitize', obj);
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Use xss to sanitize each value in the object
      sanitizedObject[key] = xss(obj[key]);
    }
  }
  return sanitizedObject;
}

// Define algorithm and key
const algorithm = 'aes-256-cbc';
const key = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex'); // 32 bytes key

// Fixed IV for deterministic encryption (make sure it's 16 bytes)
const fixedIV = Buffer.from('0123456789abcdef', 'utf8'); // 16 bytes IV for AES-256

// Encryption function (with fixed IV for emails)
export function encrypt(text: string): string {
    const cipher = crypto.createCipheriv(algorithm, key, fixedIV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Decryption function (with fixed IV for emails)
export function decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(algorithm, key, fixedIV);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}