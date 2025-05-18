import 'dotenv/config';
import { client } from '../src/services/redis';
import {Result} from "postcss";

const run = async () => {
    await client.hSet('car1', {
        color: 'red',
        year: 1950,
    });

    await client.hSet('car2', {
        color: 'blue',
        year: 1955,
    });

    await client.hSet('car3', {
        color: 'green',
        year: 1960,
    });


    // const result = await Promise.all([
    //     client.hGetAll('car1'),
    //     client.hGetAll('car2'),
    //     client.hGetAll('car3')
    // ]);

    const commnads = [1,2,3].map((id) => {
        return client.hGetAll(`car${id}`);
    })
    const result = await Promise.all(commnads);

    console.log(result);
};

run();
