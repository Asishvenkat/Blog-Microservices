import { Request,Response } from "express";
import User from "../model/User.js";
import jwt from 'jsonwebtoken';
import TryCatch from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from 'cloudinary'; 
import axios from "axios";
import { createOAuthClient } from "../utils/GoogleConfig.js";

export const loginUser=TryCatch(async(req:Request,res:Response)=>{

     const {code} = req.body;

     if(!code){
         return res.status(400).json({
             message:"Authorization code is required"
         })
     }


    const oauth2Client = createOAuthClient(req.body.redirect_uri);

    const googleRes = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(googleRes.tokens);

    const userRes = await axios.get<GoogleUserInfo>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${
        googleRes.tokens.access_token}`
    );
   

    // const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.
    //     tokens.access_token}`
    // );


     interface GoogleUserInfo {
        email: string;
        name: string;
        picture: string;
    }

   const { email, name, picture } = userRes.data;

   //const { email, name, picture } = req.body;

     let user = await User.findOne({email});

     if(!user){
         user = await User.create({email,name,image :picture});//create new user
     }

     const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
         expiresIn: "5d",
     });
     res.status(200).json({
        message: "login success",
        token,
        user  
     });
})


export const myProfile=TryCatch(async (req:AuthenticatedRequest,res)=>{
 
const user=req.user;
 res.json(user);

})
 
export const getUserProfile = TryCatch(async (req:Request,res:Response)=>{
    const user = await User.findById(req.params.id)

    if(!user){
        return res.status(404).json({
            message:"User not found"
        })
    }
   res.json(user);
})

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res: Response) => {

    const {name, instagram, facebook, linkedin, bio} = req.body;

    const user = await User.findByIdAndUpdate(req.user?._id,{
        name, instagram, facebook, linkedin, bio
    },{new: true}
    );

    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
         expiresIn: "5d",
     });

     res.json({
        message:"User Updated",
        token,
        user
     })
}); 

export const updateProfilePicture=TryCatch(async(req:AuthenticatedRequest,res:Response)=>{

    const file=req.file;
    if(!file){
        return res.status(400).json({
            message:"File not found"
        })
    }

    const image = getBuffer(file);
    if(!image){
        return res.status(400).json({
            message:"Failed to generate buffer"
        })
    }

    const cloud = await cloudinary.uploader.upload(image,{
        folder:"blogs",
    });

    const user = await User.findByIdAndUpdate(req.user?._id,{
        image: cloud.secure_url
    },{new:true});

    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
         expiresIn: "5d",
     });

     res.json({
        message:"User Profile picUpdated",
        token,
        user
     })
});