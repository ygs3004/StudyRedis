import type { CreateItemAttrs } from '$services/types';
import {serialize} from "$services/queries/items/serialize";
import {genId, isEmptyObj} from "$services/utils";
import {client} from "$services/redis";
import {itemsByViewsKey, itemsKey} from "$services/keys";
import {deserializeItem} from "$services/queries/items/deserialize";

export const getItem = async (id: string) => {
    const item = await client.hGetAll(itemsKey(id));

    if (isEmptyObj(item)) {
        return null;
    }

    return deserializeItem(id, item);
};

export const getItems = async (ids: string[]) => {
    const commands = ids.map(id => {
        return client.hGetAll(itemsKey(id));
    });

    const result = await Promise.all(commands);

    return result.map((result, idx) => {
        if (isEmptyObj(result)) {
            return null;
        };

        return deserializeItem(ids[idx], result);
    })
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
    const id = genId();
    const serialized = serialize(attrs);

    await Promise.all([
        client.hSet(itemsKey(id), serialized),
        client.zAdd(itemsByViewsKey(), {
            value: id,
            score: 0,
        })
    ])

    return id;
};
