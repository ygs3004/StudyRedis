import {client} from "$services/redis";
import {itemsByPriceKey, itemsKey} from "$services/keys";
import {deserializeItem} from "$services/queries/items/deserialize";

export const itemsByPrice = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
    let results: any = await client.sort(
        itemsByPriceKey(),
        {
            GET: [
                '#', // id
                `${itemsKey('*')}->name`, // items#*
                `${itemsKey('*')}->views`,
                `${itemsKey('*')}->endingAt`,
                `${itemsKey('*')}->imageUrl`,
                `${itemsKey('*')}->price`,
            ],
            BY: 'nosort', // nosort => 기본 순서 사용, Sorted Set
            DIRECTION: order, // 정렬방향
            LIMIT:{  // 데이터 수
                offset,
                count,
            }
        }
    );

    const items = [];
    while (results.length) {
        const [id, name, views, endingAt, imageUrl, price, ...rest] = results;
        const item = deserializeItem(id, {id, name, views, endingAt, imageUrl, price});
        items.push(item);
        results = rest;
    }

    return items;
};
