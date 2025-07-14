import type { Item } from '$services/types';
import { DateTime } from 'luxon';

export const deserializeItem = (id: string, item: { [key: string]: string }): Item => {
    return {
        id,
        name: item.name,
        ownerId: item.ownerId,
        description: item.description,
        imageUrl: item.imageUrl,
        highestBidUserId: item.highestBidUserId,
        createdAt: DateTime.fromMillis(parseInt(item.createdAt)),
        endingAt: DateTime.fromMillis(parseInt(item.endingAt)),
        views: parseInt(item.views),
        likes: parseInt(item.likes),
        price: parseFloat(item.price),
        bids: parseInt(item.bids),
    }
};
