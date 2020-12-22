import { dirname } from 'path';

export const rootDir = dirname(dirname(dirname(new URL(import.meta.url).pathname)));
