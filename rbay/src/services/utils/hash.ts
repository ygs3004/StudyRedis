import { createHash } from 'crypto';

export const hash = (key: string) => {
	return createHash('sha1').update(key).digest('hex');
};

export const isEmptyObj = (obj) => {
	return Object.keys(obj).length === 0;
}