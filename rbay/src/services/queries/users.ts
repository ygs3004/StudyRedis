import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import {client} from "$services/redis";
import {usernamesUniqueKey, usersKey} from "$services/keys";

export const getUserByUsername = async (username: string) => {};

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id));

    return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
    const id = genId();

    const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username);

    if (exists) {
        throw new Error('이미 존재하는 사용자명입니다.')
    }

    await client.hSet(usersKey(id), serialize(attrs));
    // 동시섬 문제 없다고 가정
    await client.sAdd(usernamesUniqueKey(), attrs.username);

    return id;
};

const serialize = (user: CreateUserAttrs) => {
    return {
        username: user.username,
        password: user.password
    }
};

const deserialize = (id: string, user: { [key: string]: string })=> {
    return {
        id,
        username: user.username,
        password: user.password,
    }
}