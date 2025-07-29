import {itemsByViewsKey, itemsKey, itemsViewsKey} from "$services/keys";
import {client} from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    // HyperLogsLogs, 오차율이 꽤나 존재하지만 공간적인 효율이 높아 조회수 같은 정확성이 비교적 덜 중요한 경우 사용
    // const inserted = await client.pfAdd(itemsViewsKey(itemId), userId);
    //
    // if(inserted) {
    //     return Promise.all([
    //         client.hIncrBy((itemsKey(itemId)), 'views', 1),
    //         client.zIncrBy(itemsByViewsKey(), 1, itemId)
    //     ]);
    // }

    return client.incrementView(itemId, userId);
};