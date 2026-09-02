import crypto from 'node:crypto';
export const canonical = (value: unknown): string => JSON.stringify(value, (_k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((o:Record<string,unknown>, k) => {o[k]=v[k]; return o;}, {}) : v);
export const sha256 = (value: unknown) => crypto.createHash('sha256').update(typeof value === 'string' ? value : canonical(value)).digest('hex');
export const hmac = (value: unknown, secret: string) => crypto.createHmac('sha256', secret).update(typeof value === 'string' ? value : canonical(value)).digest('hex');
export const safeEqual = (a:string,b:string) => { const aa=Buffer.from(a); const bb=Buffer.from(b); return aa.length===bb.length && crypto.timingSafeEqual(aa,bb); };
export const id = (prefix:string) => `${prefix}_${crypto.randomUUID().replaceAll('-','')}`;
