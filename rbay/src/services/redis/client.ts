import {createClient, defineScript} from 'redis';
import {itemsByViewsKey, itemsKey, itemsViewsKey} from "$services/keys";
import {createIndexes} from "$services/redis/create-indexes";

const client = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    },
    password: process.env.REDIS_PW,
    scripts: {
        unlock: defineScript({
            NUMBER_OF_KEYS: 1,
            SCRIPT: `
                if redis.call('GET', KEYS[1]) == ARGV[1] then
                    return redis.call('DEL', KEYS[1])
                end
            `,
            transformArguments(key: string, token: string){
                return [key, token];
            },
            transformReply(reply: any) {
                return reply;
            }
        }),
        addOneAndStore: defineScript({
            NUMBER_OF_KEYS: 1, // 키값으로 사용할 인수 수
            SCRIPT: ` 
                return redis.call('SET', KEYS[1], 1 + tonumber(ARGV[1]))
            `, // 스크립트 내용
            transformArguments(key: string, value: number) {
                return [key, value.toString()]
                // 스크립트에 전달할 인수
                // ['books:count', '5']
                // EVALSHA <ID> 1 'books:count', '5' 
            },
            transformReply(reply: any) { // 결과반환
                return reply
            }
        }),
        incrementView: defineScript({
            NUMBER_OF_KEYS: 3,
            SCRIPT: `
                local itemsViewsKey = KEYS[1]
                local itemsKey = KEYS[2]
                local itemsByViewsKey = KEYS[3]
                local itemId = ARGV[1]
                local userId = ARGV[2]
                
                local inserted = redis.call('PFADD', itemsViewsKey, userId)
                
                if inserted == 1 then
                     redis.call('HINCRBY', itemsKey, 'views', 1)
                     redis.call('ZINCRBY', itemsByViewsKey, 1, itemId)
                end
            `,
            transformArguments(itemId: string, userId: string) {
                return [
                    itemsViewsKey(itemId), // -> items:views#~~
                    itemsKey(itemId), // items#~~
                    itemsByViewsKey(), // items:views
                    itemId,
                    userId
                ];
                // EVALSHA 3 items:views#~~ items#~~ items:views 'itemId' 'userId'
            },
            transformReply(){
            }
        })
    }
});

client.on('error', (err) => console.error(err));
client.connect();

client.on('connect', async () => {
    try {
        await createIndexes()
    } catch (err){
        console.error(err)
    }

})

export { client };
