import amqp from 'amqplib';
import { redisClient } from '../server.js';
import { sql } from './db.js';

interface CacheInvalidationMessage {
    action: string;
    keys: string[];
}

export const startCacheConsumer = async () => {
    try {
        const rabbitMQUrl = process.env.RABBITMQ_URL;
        
        if (!rabbitMQUrl) {
            console.error("❌ RABBITMQ_URL is not defined in environment variables");
            return;
        }

        const connection = await amqp.connect(rabbitMQUrl);

          const channel = await connection.createChannel();
          const queueName = "cache_invalidation"; 
          await channel.assertQueue(queueName, { durable: true }); 
         console.log("✅ Blog Service cache consumer started"); 

         channel.consume(queueName, async (msg) => {
            if (msg) {
                try{
                    const content = JSON.parse(
                        msg.content.toString()
                    ) as CacheInvalidationMessage;
                    
                    console.log("📩 Blog service received cache invalidation message", 
                        content
                    );
                   
                    if (content.action === "invalidate_cache") {
                        for (const pattern of content.keys) {
                            let keys: string[] = [];
                            try {
                                keys = await redisClient.keys(pattern);
                            } catch (err) {
                                console.error("Redis keys lookup failed during invalidation:", err);
                            }

                            if(keys.length > 0){
                                try {
                                    await redisClient.del(keys);
                                    console.log(`🗑️ Blog service invalidated ${keys.length} cache keys matching: ${pattern}`);
                                } catch (err) {
                                    console.error("Redis del failed during invalidation:", err);
                                }
                
                                const category = ""

                                const searchQuery = ""

                                const cacheKey = `blogs:${searchQuery}:${category}`;

                                const blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;

                                try {
                                    await redisClient.setEx(cacheKey, 3600, JSON.stringify(blogs)); 
                                    console.log("🔄️ Cache rebuilt with key:", cacheKey);
                                } catch (err) {
                                    console.error("Redis setEx failed during cache rebuild:", err);
                                }
                            }
                        }
                    }
                 channel.ack(msg);
                }catch (err) {
                    console.error("❌ Error processing cache invalidation message", err);

                    channel.nack(msg, false, false);
                 }
            }
        })
        }catch (error) {
        console.error("❌ Error connecting to RabbitMQ:", error);
        return;
    }
}
