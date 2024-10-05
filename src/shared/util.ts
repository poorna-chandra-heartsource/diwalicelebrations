import xss, { filterXSS } from 'xss';

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