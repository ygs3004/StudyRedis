import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import {client} from "$services/redis";
import {usernameKey, usernamesUniqueKey, usersKey} from "$services/keys";

export const getUserByUsername = async (username: string) => {

    // username 을 이용하여 usernames SortedSEet 에서 User Id 체크
    const decimalId = await client.zScore(usernameKey(), username);

    // 반환값 유무로 회원가입여부 체크
    if (!decimalId) {
        throw new Error('존재하지 않는 유저정보입니다.')
    }

    // 16진수 id 스코어 -> 문자열 id 변환
    const id = decimalId.toString(16);

    // deserialize hash 반환
    const user = await client.hGetAll(usersKey(id));
    return deserialize(id, user);
};

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
    await client.zAdd(usernameKey(), {
        value: attrs.username,
        score: parseInt(id, 16) // 16진수 이용 id 문자를 Sorted Set의 스코어로 사용
    });

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