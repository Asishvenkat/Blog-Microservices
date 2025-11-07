import Link from "next/link";
import React from "react";
import { Card } from "./ui/card";
import { Calendar } from "lucide-react";
import moment from "moment";
import Image from "next/image";

interface BlogCardProps {
  image: string;
  title: string;
  desc: string;
  id: string;
  time: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  desc,
  id,
  time,
}) => {
  return (
    <Link href={`/blog/${id}`}>
      <Card className="overflow-hidden rounded-lg shadow-none transition-shadow duration-300 hover:shadow-xl border-none">
        <div className="w-full h-[200px] relative">
          <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>

        <div className="p-0">
          <div>
            <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Calendar size={16} />
              <span>{moment(time).format("DD-MM-YYYY")}</span>
            </p>
            <h2 className="text-lg font-semibold mt-1 line-clamp-1 text-center">
              {title}
            </h2>
            <p className="text-center">{desc.slice(0, 30)}...</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;