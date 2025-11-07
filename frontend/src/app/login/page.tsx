"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData, user_service } from '@/context/AppContext';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Loading from '@/components/loding';

interface LoginResponse {
  token: string;
  message: string;
  user: any;
}

const Login = () => {
  const router = useRouter();
  const {isAuth, setIsAuth, setLoading, loading, setUser} = useAppData();

  // Client-side redirect if already authenticated
  useEffect(() => {
    if (isAuth) router.push("/");
  }, [isAuth, router]);

  const reponseGoogle = async (authResult: { code: string }) => {
    try {
      setLoading(true); // show loading
      const result = await axios.post<LoginResponse>(`${user_service}/api/v1/login`, {
        code: authResult.code,
      });

      Cookies.set("token", result.data.token, {
        expires: 7,
        secure: true,
        path: "/",
      });

      setIsAuth(true);
      setUser(result.data.user);
      toast.success(result.data.message);
    } catch (err) {
      console.log("Error", err);
      toast.error("Login failed");
    } finally {
      setLoading(false); // hide loading
    }
  }

  const googlelogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (authResult) => {
      if (!authResult.code) {
        toast.error("Google login failed: no code received");
        return;
      }
      await reponseGoogle(authResult);
    },
    onError: (err) => {
      console.error("Google login error", err);
      toast.error("Google login failed");
    }
  });

  if (loading) return <Loading />;

  return (
    <div className='w-[390px] m-auto mt-[200px]'>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to The Reading Retreat</CardTitle>
          <CardDescription>Your go-to blog app</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={googlelogin}>
            Login with Google
            <img src={'/google.webp'} className='w-6 h-6 ml-2' alt="google icon"/>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login;
