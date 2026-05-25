import express from 'express';
import dotenv from 'dotenv';
import blogRoutes from './routes/blog.js';
import {createClient} from 'redis';
import { startCacheConsumer } from './utils/consumer.js';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://blog-microservices-neon.vercel.app'],
  credentials: true
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5002;

export const redisClient = createClient({
    url: process.env.REDIS_URL
});

app.use('/api/v1', blogRoutes);

app.listen(PORT, () => {
    console.log(`Blog service is running on port ${PORT}`);

    // Connect to Redis asynchronously after server starts
    redisClient
      .connect()
      .then(() => console.log("Connected to Redis"))
      .catch((err) => console.error("Redis connection error:", err));

    // Connect to RabbitMQ consumer asynchronously after server starts
    startCacheConsumer()
      .then(() => console.log("RabbitMQ consumer connected"))
      .catch((err) => console.error("RabbitMQ connection error:", err));
});

