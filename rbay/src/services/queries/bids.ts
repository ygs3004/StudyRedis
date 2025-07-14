import type { CreateBidAttrs, Bid } from '$services/types';
import {DateTime} from "luxon";
import {client} from "$services/redis";
import {bidHistoryKey, itemsKey} from "$services/keys";
import {getItem} from "$services/queries/items";

export const createBid = async (attrs: CreateBidAttrs) => {

    const item = await getItem(attrs.itemId);
    if (!item) {
        throw new Error('아이템이 존재하지 않습니다.');
    }

    if (item.price >= attrs.amount) {
        throw new Error('입찰가능한 최소 입찰가보다 낮습니다.');
    }

    if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
        throw new Error('입찰이 종료된 건입니다.')
    }

    const serialized = serializeHistory(
        attrs.amount,
        attrs.createdAt.toMillis()
    );

    return Promise.all([
        client.rPush(bidHistoryKey((attrs.itemId)), serialized),
        client.hSet(itemsKey(item.id), {
            bids: item.bids + 1,
            price: attrs.amount,
            highestBidUserId: attrs.userId,
        })
    ]);
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