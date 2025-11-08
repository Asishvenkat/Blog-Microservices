"use client";

import React, { useEffect, useState } from 'react';
import { useAppData, blog_service, author_service, Blog } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import Loading from '@/components/loding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

const MyBlogsPage = () => {
  const { user, isAuth, loading: authLoading } = useAppData();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuth) {
      router.push("/login");
    }
  }, [authLoading, isAuth, router]);

  useEffect(() => {
    const fetchMyBlogs = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const token = Cookies.get("token");
        console.log("Fetching blogs for user:", user._id);
        console.log("API URL:", `${blog_service}/api/v1/blog/author/${user._id}`);
        
        const response = await axios.get(
          `${blog_service}/api/v1/blog/author/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const data = response.data as { blogs: Blog[] };
        console.log("Response data:", data);
        
        if (Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        toast.error("Failed to load your blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchMyBlogs();
    }
  }, [user?._id]);

  const handleEdit = (blogId: string) => {
    router.push(`/blog/${blogId}/edit`);
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const token = Cookies.get("token");
      await axios.delete(
        `${author_service}/api/v1/blog/${blogId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success("Blog deleted successfully");
      setBlogs(blogs.filter(blog => blog.id !== blogId));
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Blogs</h1>
        <Button onClick={() => router.push("/blog/new")}>
          Create New Blog
        </Button>
      </div>

      {blogs.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground mb-4">You haven&apos;t created any blogs yet.</p>
            <Button onClick={() => router.push("/blog/new")}>
              Create Your First Blog
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                {blog.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2 line-clamp-2">{blog.title}</CardTitle>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {blog.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/blog/${blog.id}`)}
                    className="flex-1"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(blog.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(blog.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlogsPage;
