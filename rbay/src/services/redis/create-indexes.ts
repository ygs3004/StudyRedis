import {itemsIndexKey, itemsKey} from "$services/keys";
import {client} from "$services/redis/client";
import {SchemaFieldTypes} from "redis";

export const createIndexes = async () => {
    const indexes = await client.ft._list();
    console.log("FT_LIST: " + indexes);

    const exists = indexes.find(index => index === itemsIndexKey());

    if (exists) {
        return;
    }

    return client.ft.create(
        itemsIndexKey(),
        {
            name: {
                type: SchemaFieldTypes.TEXT
            },
            description: {
                type: SchemaFieldTypes.TEXT
            }
        },
        {
            ON: 'HASH',
            PREFIX: itemsKey('')
        }
    );
};
