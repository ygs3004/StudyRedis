import type { CreateBidAttrs, Bid } from '$services/types';
import {DateTime} from "luxon";
import {client, withLock} from "$services/redis";
import {bidHistoryKey, itemsByPriceKey, itemsKey} from "$services/keys";
import {getItem} from "$services/queries/items";

const pause = (duration: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
};


export const createBid = async (attrs: CreateBidAttrs) => {
    return withLock(attrs.itemId, async (lockedClient: typeof client , signal: any) => {

        const item = await getItem(attrs.itemId);

        // Expire Test
        // await pause(5000)

        if (!item) {
            throw new Error('아이템이 존재하지 않습니다.');
        }

        if (item.price >= attrs.amount) {
            throw new Error('입찰가능한 최소 입찰가보다 낮습니다.');
        }

        if (item.endingAt.diff(DateTime.now()).toMillis() <= 0) {
            throw new Error('입찰이 종료된 건입니다.')
        }

        const serialized = serializeHistory(
            attrs.amount,
            attrs.createdAt.toMillis()
        );

        // proxy로 처리
        // if(signal.expired){
        //     throw new Error('Lock 이 만료되었습니다. 데이터를 변경할 수 없습니다.')
        // }

        return Promise.all([
            lockedClient.rPush(bidHistoryKey((attrs.itemId)), serialized),
            lockedClient.hSet(itemsKey(item.id), {
                bids: item.bids + 1,
                price: attrs.amount,
                highestBidUserId: attrs.userId,
            }),
            lockedClient.zAdd(itemsByPriceKey(), {
                value: item.id,
                score: attrs.amount
            }),
        ])
    })
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
    const startIdx = (-1 * offset) - count;
    const endIdx = -1 - offset;

    const range = await client.lRange(
        bidHistoryKey(itemId),
        startIdx,
        endIdx,
    )
    return range.map(bid => deserializeHistory(bid));
};

const serializeHistory = (amount: number, createdAt: number) => {
    return `${amount}:${createdAt}`
};

const deserializeHistory = (stored:String) => {
    const [amount, createdAt] = stored.split(':');
    return {
        amount: parseFloat(amount),
        createdAt: DateTime.fromMillis(parseInt(createdAt)),
    }
}