import { createClient } from "redis"

export const redis_client = createClient({
  url: "rediss://default:gQAAAAAAAWkkAAIgcDJkNDdkMzY5ZGJkMDI0NmM1YjkxZjdhNjZmYTA5Nzc4NA@sought-hen-92452.upstash.io:6379"
});

export default async function connectRedis() {
    try {
        await redis_client.connect();
        console.log("redis connected succesfully😍");
    } catch (error) {
        console.log("redis connection failed😭");
        console.log(error)
    }
}