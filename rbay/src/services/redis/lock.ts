import {randomBytes} from "crypto";
import {client} from "$services/redis/client";

export const withLock = async (key: string, callback: (signal: any) => any) => {
    const retryDelayMs = 100;
    let retries = 20;

    const token = randomBytes(6).toString('hex');
    const lockKey = `lock:${key}`;

    while(retries-- >= 0) {
        const acquired = await client.set(lockKey, token, {
            NX: true,
            PX: 2000, // 오류 및 기타 서버 오류시 지연시간 후 잠금해제 되도록
        });

        if (!acquired) {
            await pause(retryDelayMs);
            continue;
        }

        try{
            const signal = {expired: false};
            setTimeout(() => {
                signal.expired = true;
            });
            const result = await callback(signal);
            return result;
        } finally {
            // 로직종료, 유효성 검사, callback 내 임의 Error로 인한 Lock 해제
            await client.unlock(lockKey, token);
        }
    }
};

const buildClientProxy = () => {};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
