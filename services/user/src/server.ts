import  express from "express";
import dotenv from "dotenv"
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.js";
import { v2 as cloudinary } from 'cloudinary';  
import cors from 'cors'

dotenv.config();

const app = express();

cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.Cloud_Api_Key,
  api_secret: process.env.Cloud_Api_Secret
});

app.use(express.json());
app.use(cors());

app.use("/api/v1", userRoutes);


const port =process.env.PORT

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});