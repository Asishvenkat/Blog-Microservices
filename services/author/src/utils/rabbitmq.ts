import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    try {
        const rabbitMQUrl = process.env.RABBITMQ_URL;
        
        if (!rabbitMQUrl) {
            console.error("❌ RABBITMQ_URL is not defined in environment variables");
            return;
        }

        const connection = await amqp.connect(rabbitMQUrl);
        channel = await connection.createChannel();

        console.log("✅ Connected to RabbitMQ");
    } catch (error) {
        console.error("❌ Error connecting to RabbitMQ:", error);
    }
};

export const publishToQueue = async(queueName: string, message: any) => {
    if (!channel) {
        console.error("Channel not initialized");
        return;
    }

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)),
     { persistent: true });
};

export const invalidateCacheJob = async (cachekeys: string[]) => {

     try{
        const message={
            action: "invalidate_cache",
            keys: cachekeys
        }
        await publishToQueue("cache_invalidation", message);
        console.log("✅Cache invalidation job published");
     }catch(err){
        console.error("❌Error publishing cache invalidation job",err);
     }  
}; 
