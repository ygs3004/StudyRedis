import {randomBytes} from "crypto";
import {client} from "$services/redis/client";

export const withLock = async (key: string, callback: () => any) => {
    const retryDelayMs = 100;
    let retries = 20;

    const token = randomBytes(6).toString('hex');
    const lockKey = `lock:${key}`;

    while(retries-- >= 0) {
        const acquired = await client.set(lockKey, token, {
            NX:true,
        });

        if (!acquired) {
            await pause(retryDelayMs);
            continue;
        }

        const result = await callback();
        await client.del(lockKey);
        return result;
    }
};

const buildClientProxy = () => {};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
