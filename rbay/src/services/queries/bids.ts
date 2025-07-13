import type { CreateBidAttrs, Bid } from '$services/types';
import {DateTime} from "luxon";
import {client} from "$services/redis";
import {bidHistoryKey} from "$services/keys";

export const createBid = async (attrs: CreateBidAttrs) => {
	const serialized = serializeHistory(
		attrs.amount,
		attrs.createdAt.toMillis()
	);

	return client.rPush(bidHistoryKey((attrs.itemId)), serialized)
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