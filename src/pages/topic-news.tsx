import { useParams } from "react-router-dom";
import { useTopicNews } from "@/features/news/api/useTopicNews";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

export default function TopicNewsPage() {
  const { key } = useParams<{ key: string }>();
  const [page, setPage] = useState(1);
  const [allNews, setAllNews] = useState<any[]>([]);
  const observerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useTopicNews(key || "", "vi", page, 12);

  useEffect(() => {
    if (data?.news_info) {
      setAllNews((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newNews = data.news_info.filter((n: any) => !existingIds.has(n.id));
        return [...prev, ...newNews];
      });
    }
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && data?.news_info && data.news_info.length > 0) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, data]);

  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-destructive">Không thể tải dữ liệu tin tức.</p>
      </div>
    );
  }

  const news = allNews;
  const topicName = data?.name || key;
  const totalRecords = data?.total_records || 0;

  return (
    <div className="container mx-auto px-4 space-y-6">
      <h1 className="text-2xl font-semibold">{topicName}</h1>

      {news.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có tin tức nào.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {news.map((n: any) => (
              <a key={n.id} href={`/tin-tuc/${n.slug}`} rel="noreferrer">
                <Card className="overflow-hidden group h-full pt-0 shadow-none">
                  <div className="aspect-video bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {n.news_image_url ? (
                      <img
                        src={n.news_image_url}
                        alt={n.news_title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-sm font-medium line-clamp-2">{n.news_title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.news_short_content}</p>
                  </div>
                </Card>
              </a>
            ))}
          </div>

          {/* Intersection observer target */}
          <div ref={observerRef} className="h-10 flex items-center justify-center">
            {isLoading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-4 space-y-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}