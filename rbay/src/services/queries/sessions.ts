import type { Session } from '$services/types';
import {client} from "$services/redis";
import {sessionsKey} from "$services/keys";
import {sessionKey} from "../../../seeds/seed-keys";
import {isEmptyObj} from "$services/utils";


export const getSession = async (id: string) => {
    const session = await client.hGetAll(sessionsKey(id));

    if (isEmptyObj(session)) {
        return null;
    }

    return deserialize(id, session);
};

export const saveSession = async (session: Session) => {
    return client.hSet(sessionKey(session.id), serialize(session));
};

const serialize = (session: Session) => {
    return {
        userId: session.userId,
        username: session.username,
    };
}

const deserialize = (id: string, session: { [key: string]: string;})=> {
    return {
        id,
        userId: session.userId,
        username: session.username,
    }
}
