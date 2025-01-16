import Elysia from "elysia";
import redis from '../config/redisClient';

type CacheEntry = {
    key: string;
    value: string | number | Buffer;
  };
  
  type CacheResponse = {
    message?: string;
    error?: string;
    entries?: Record<string, string | null>;
    key?: string;
    value?: string | null;
  };


export const cachRoute = new Elysia()
.get("/cache/:key", async({ params }): Promise<Response>=>{
    try{
    const { key } = params;
    const value = await redis.get(key);
    if(value){
        return new Response(value);
    } else {
        return new Response(JSON.stringify({ message: "Key not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }
    }
    catch(err){
        return new Response(JSON.stringify({ error: "Failed to fetch cache entry" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
})
.post("/createCache", async({ request }): Promise<Response>=>{
    
    const { key, value } = await request.json();
    const entry: CacheEntry = { key, value };
    try{
    await redis.set(entry.key, entry.value);
    return new Response(JSON.stringify({ message: "cache entry successfully created" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
    }
    catch(err){
        return new Response(JSON.stringify({ error: "Failed to create cache entry" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
})
.get("/cacheAll", async (): Promise<Response> => {
  try {
      const keys: string[] = await redis.keys("*");
      if (keys.length === 0) {
          const response: CacheResponse = { message: "No cache entries found" };
          return new Response(JSON.stringify(response), {
              status: 200,
              headers: { "Content-Type": "application/json" },
          });
      }

      const entries: Record<string, string | null> = {};
      for (const key of keys) {
          const keyType = await redis.type(key);
          if (keyType === "string") {
              entries[key] = await redis.get(key);
          } else {
              entries[key] = `Key type is ${keyType}, not retrievable with GET`;
          }
      }

      const response: CacheResponse = { entries };
      return new Response(JSON.stringify(response), {
          status: 200,
          headers: { "Content-Type": "application/json" },
      });
  } catch (err) {
      console.error("Error fetching all cache entries:", err);
      const response: CacheResponse = { error: "Failed to fetch cache entries" };
      return new Response(JSON.stringify(response), {
          status: 500,
          headers: { "Content-Type": "application/json" },
      });
  }
});