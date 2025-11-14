import { sql } from "../utils/db.js"
import TryCatch from "../utils/TryCatch.js"
import axios from "axios";
import { redisClient } from "../server.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";

export const getAllBlogs = TryCatch(async (req, res) => {
    const {searchQuery = "",category = ""} = req.query;
   
   const cacheKey = `blogs:${searchQuery}:${category}`;

   const cached = await redisClient.get(cacheKey);

   if(cached){
     console.log("Serving from cache")
     res.json(JSON.parse(cached));
     return;
   }

   let blogs;

    if(searchQuery && category){
        blogs= await sql`SELECT * FROM blogs WHERE title ILIKE ${'%' + 
            searchQuery + '%'} OR description ILIKE ${'%' + searchQuery + '%'} 
            AND category = ${category} ORDER BY create_at DESC`
        return res.status(200).json({ blogs })
    }
    else if(searchQuery){
           blogs= await sql`SELECT * FROM blogs WHERE title ILIKE ${'%' + 
            searchQuery + '%'} OR description ILIKE ${'%' + searchQuery + '%'} 
             ORDER BY create_at DESC`
    }
    else if(category){
            blogs= await sql`SELECT * FROM blogs WHERE category = ${category} ORDER BY create_at DESC`
    }
    else{
            blogs= await sql`SELECT * FROM blogs ORDER BY create_at DESC`
    }
   
    console.log("Serving from DB")

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(blogs)); // Cache for 1 hour

    res.status(200).json({ blogs })
});

export const getSingleBlog = TryCatch(async (req, res) => {
    
    const blogid = req.params.id;

    const cacheKey = `blog:${blogid}`;

    const cached = await redisClient.get(cacheKey);

    if(cached){
        console.log("Serving from cache")
        res.json(JSON.parse(cached));
        return;
    }
    const blog = await sql`SELECT * FROM blogs WHERE id = ${blogid}`;
    
    if(blog.length === 0){
        return res.status(404).json({message: "Blog not found"})
    }
    const {data} = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0].author}`)

    await redisClient.setEx(cacheKey, 3600, JSON.stringify({ blog: blog[0], author: data})); 

    console.log("Serving from DB")
    
    res.status(200).json({ blog: blog[0], author: data})
});

export const addComment = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id: blogid } = req.params;
  const { comment } = req.body;

  // Ensure blog exists and get its author to satisfy schema
  const blog = await sql`SELECT * FROM blogs WHERE id = ${blogid}`;
  if (!blog || blog.length === 0) {
    return res.status(404).json({ message: "Blog not found" });
  }

  const blogAuthor = blog[0].author;

  await sql`INSERT INTO comments (comment, blogid, userid, username, author) VALUES (${comment}, ${blogid}, ${req.user?._id}, ${req.user?.name}, ${blogAuthor}) RETURNING *`;

  res.json({
    message: "Comment Added",
  });
});

export const getAllComments = TryCatch(async (req, res) => {
  const { id } = req.params;

  const comments =
    await sql`SELECT * FROM comments WHERE blogid = ${id} ORDER BY create_at DESC`;

  res.json(comments);
});

export const deleteComment = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { commentid } = req.params;

    const comment = await sql`SELECT * FROM comments WHERE id = ${commentid}`;

    console.log(comment);

    if (comment[0].userid !== req.user?._id) {
      res.status(401).json({
        message: "You are not owner of this comment",
      });
      return;
    }

    await sql`DELETE FROM comments WHERE id = ${commentid}`;

    res.json({
      message: "Comment Deleted",
    });
  }
);

export const saveBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { blogid } = req.params;
  const userid = req.user?._id;

  if (!blogid || !userid) {
    res.status(400).json({
      message: "Missing blog id or userid",
    });
    return;
  }

  const existing =
    await sql`SELECT * FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid}`;

  if (existing.length === 0) {
    await sql`INSERT INTO savedblogs (blogid, userid) VALUES (${blogid}, ${userid})`;

    res.json({
      message: "Blog Saved",
    });
    return;
  } else {
    await sql`DELETE FROM savedblogs WHERE userid = ${userid} AND blogid = ${blogid}`;

    res.json({
      message: "Blog Unsaved",
    });
    return;
  }
});

export const getSavedBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const blogs =
    await sql`SELECT * FROM savedblogs WHERE userid = ${req.user?._id}`;

  res.json(blogs);
});