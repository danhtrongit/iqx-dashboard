import { useTopics } from "@/features/news/api/useTopics";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function NewsPage() {
  const { data, isLoading, error } = useTopics("vi");
  const [activeId, setActiveId] = useState<string | null>(null);

  const staticSections = data?.static_topic ?? [];
  const dynamicSections = data?.dynamic_topic ?? [];
  const allSections = [...staticSections, ...dynamicSections];

  useEffect(() => {
    const ids = allSections.map((s) => `topic-${s.key}`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: "-128px 0px -70% 0px", threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [allSections]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-destructive">Không thể tải dữ liệu chủ đề.</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 space-y-10">


        {allSections.length > 0 ? (
          <HeaderMenu sections={allSections} activeId={activeId ?? undefined} />
        ) : null}

        {staticSections.map((section) => (
          <TopicSection key={section.key} idName={`topic-${section.key}`} section={section} />
        ))}

        {dynamicSections.map((section) => (
          <TopicSection key={section.key} idName={`topic-${section.key}`} section={section} />
        ))}
      </div>
    </>
  );
}

function HeaderMenu({ sections, activeId }: { sections: Array<{ name: string; key: string }>; activeId?: string }) {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div className="h-12" />
      <div className="fixed top-28 left-0 right-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            {sections.map((s) => {
              const id = `topic-${s.key}`;
              const isActive = activeId === id;
              return (
                <button
                  key={s.key}
                  onClick={() => handleClick(id)}
                  className={
                    "shrink-0 px-3 py-1 rounded-full text-xs md:text-sm transition-colors " +
                    (isActive ? "bg-primary/15 text-primary" : "bg-muted hover:bg-muted/80")
                  }
                  type="button"
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function TopicSection({ section, idName }: { section: { name: string; key: string; news: Array<any> }; idName: string }) {
  return (
    <section id={idName} className="scroll-mt-[112px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground">{section.name}</h2>
        <Link
          to={`/tin-tuc/danh-muc/${section.key}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Xem thêm
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {section.news.slice(0, 8).map((n) => (
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
    </section>
  );
}
