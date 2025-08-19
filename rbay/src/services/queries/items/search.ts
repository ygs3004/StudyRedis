import {itemsIndexKey} from "$services/keys";
import {client} from "$services/redis";
import {deserializeItem} from "$services/queries/items/deserialize";

export const searchItems = async (term: string, size: number = 5) => {
    
    //fuzzy search example, RedisSearch 의 fuzzy search 는 한글은 안됨ㅠㅠ... Elasticsearch 검색 시스템 필요
    const cleaned = term
        .replaceAll(/[^ㄱ-ㅎ가-힣a-zA-Z0-9 ]/g, "")
        .trim()
        .split(" ")
        .map(word => word ? `%${word}%` : word)
        .join (' ');


    const query = `(@name:(${cleaned}) => { $weight: 5.0 }) | (@description:(${cleaned}))`

    if(cleaned === ''){
        return [];
    }

    const results = await client.ft.search(
        itemsIndexKey(),
        query,
        {
            LIMIT: {
                from: 0,
                size
            }
        }
    )

    return results.documents.map(({id, value}) => deserializeItem(id, value as any))
};
