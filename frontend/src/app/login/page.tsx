"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppData, user_service } from "@/context/AppContext";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Loading from "@/components/loding";
import { User } from "@/context/AppContext";

interface LoginResponse {
  token: string;
  message: string;
  user: User;
}

const Login = () => {
  const router = useRouter();
  const { isAuth, setIsAuth, setLoading, loading, setUser } = useAppData();

  useEffect(() => {
    if (isAuth) router.push("/");
  }, [isAuth, router]);

  const reponseGoogle = async (authResult: { code: string }) => {
    try {
      setLoading(true);

      const result = await axios.post<LoginResponse>(
        `${user_service}/api/v1/login`,
        {
          code: authResult.code,
        }
      );

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
      setLoading(false);
    }
  };

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
    },
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <Card className="w-full max-w-md shadow-xl backdrop-blur-md bg-white/80 border border-white/40">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome Back 
          </CardTitle>
          <CardDescription className="text-base">
            Login to <span className="font-semibold">The Reading Retreat</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-4 flex flex-col items-center">
          <Button
            onClick={googlelogin}
            className="w-full flex items-center justify-center gap-3 py-6 text-lg hover:bg-gray-100"
            variant="outline"
          >
            <img
              src={"/google.webp"}
              className="w-6 h-6"
              alt="google icon"
            />
            Login with Google
          </Button>

          <p className="text-sm text-gray-600 mt-4 text-center">
            By continuing, you agree to our{" "}
            <span className="text-blue-600 cursor-pointer">Terms</span> and{" "}
            <span className="text-blue-600 cursor-pointer">Privacy Policy</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
