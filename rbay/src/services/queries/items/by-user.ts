import {getItem} from "$services/queries/items/items";

interface QueryOpts {
	page: number;
	perPage: number;
	sortBy: string;
	direction: string;
}

export const itemsByUser = async (userId: string, opts: QueryOpts) => {
		return {
			items:getItem(userId)
		}
	}


;
