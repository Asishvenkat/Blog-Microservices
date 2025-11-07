import express from "express";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import blogRoutes from "./routes/blog.js";
import { v2 as cloudinary } from 'cloudinary';
import { connectRabbitMQ } from "./utils/rabbitmq.js";
import cors from "cors";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.Cloud_Api_Key,
  api_secret: process.env.Cloud_Api_Secret
});

const app = express();

app.use(cors());
app.use(express.json());

connectRabbitMQ();

const port = process.env.PORT || 5001;

async function initDb(){
  try{
    await sql`
    CREATE TABLE IF NOT EXISTS blogs(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    blogcontent TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    await sql`
    CREATE TABLE IF NOT EXISTS comments(
    id SERIAL PRIMARY KEY,
    comment VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    blogid VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    await sql`
    CREATE TABLE IF NOT EXISTS savedblogs(
    id SERIAL PRIMARY KEY,
    userid VARCHAR(255) NOT NULL,
    blogid VARCHAR(255) NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    console.log("database initialized successfully");
  }
  catch(err){
    console.log("Error initDb",err);
  }
}

app.use("/api/v1", blogRoutes);

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Author service is running on port http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("❌ Failed to initialize DB:", err);
});
