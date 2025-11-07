import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";
import { redisClient } from "../server.js";
export const getAllBlogs = TryCatch(async (req, res) => {
    const { searchQuery = "", category = "" } = req.query;
    const cacheKey = `blogs:${searchQuery}:${category}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log("Serving from cache");
        res.json(JSON.parse(cached));
        return;
    }
    let blogs;
    if (searchQuery && category) {
        blogs = await sql `SELECT * FROM blogs WHERE title ILIKE ${'%' +
            searchQuery + '%'} OR description ILIKE ${'%' + searchQuery + '%'} 
            AND category = ${category} ORDER BY create_at DESC`;
        return res.status(200).json({ blogs });
    }
    else if (searchQuery) {
        blogs = await sql `SELECT * FROM blogs WHERE title ILIKE ${'%' +
            searchQuery + '%'} OR description ILIKE ${'%' + searchQuery + '%'} 
             ORDER BY create_at DESC`;
    }
    else if (category) {
        blogs = await sql `SELECT * FROM blogs WHERE category = ${category} ORDER BY create_at DESC`;
    }
    else {
        blogs = await sql `SELECT * FROM blogs ORDER BY create_at DESC`;
    }
    console.log("Serving from DB");
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(blogs)); // Cache for 1 hour
    res.status(200).json({ blogs });
});
export const getSingleBlog = TryCatch(async (req, res) => {
    const blogid = req.params.id;
    const cacheKey = `blog:${blogid}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log("Serving from cache");
        res.json(JSON.parse(cached));
        return;
    }
    const blog = await sql `SELECT * FROM blogs WHERE id = ${blogid}`;
    if (blog.length === 0) {
        return res.status(404).json({ message: "Blog not found" });
    }
    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0].author}`);
    await redisClient.setEx(cacheKey, 3600, JSON.stringify({ blog: blog[0], author: data }));
    console.log("Serving from DB");
    res.status(200).json({ blog: blog[0], author: data });
});
