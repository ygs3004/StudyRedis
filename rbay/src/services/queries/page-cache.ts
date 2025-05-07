import {client} from "$services/redis";

const cacheRoutes = [
    '/about', '/privacy', '/auth/signin', '/auth/signup'
];

const pageCacheKeyPrefix = 'pagecache#';

export const getCachedPage = (route: string) => {
    if (cacheRoutes.includes(route)) {
        return client.get(pageCacheKeyPrefix + route)
    }

    return null;
};

export const setCachedPage = (route: string, page: string) => {
    if (cacheRoutes.includes(route)) {
        return client.set(pageCacheKeyPrefix + route, page, {
            EX: 2,
        });
    }
};
