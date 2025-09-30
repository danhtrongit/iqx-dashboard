import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useNews } from "@/features/news/api/useNews"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function LastestNews() {
    const { data: allNews, isLoading, isError } = useNews(undefined, 20)

    const newsItems = allNews?.news_info?.slice(0, 12) || []

    const NewsCarousel = ({ news }: { news: any[] }) => {
        return (
            <>
                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="overflow-hidden pt-0">
                                <Skeleton className="h-44 w-full" />
                                <CardContent className="p-4 space-y-2 pt-0">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="relative">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={16}
                            slidesPerView={2}
                            breakpoints={{
                                1024: {
                                    slidesPerView: 4,
                                },
                            }}
                            navigation={{
                                nextEl: '.custom-swiper-button-next',
                                prevEl: '.custom-swiper-button-prev',
                            }}
                            pagination={{
                                el: '.custom-swiper-pagination',
                                clickable: true,
                                bulletClass: 'custom-swiper-bullet',
                                bulletActiveClass: 'custom-swiper-bullet-active',
                            }}
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true,
                            }}
                            loop={true}
                            className="w-full"
                        >
                            {news.map((item) => (
                                <SwiperSlide key={item.id}>
                                    <Link
                                        to={`/tin-tuc/${String(item.slug || item.id)}`}
                                        className="block h-full"
                                    >
                                        <Card className="overflow-hidden pt-0 transition-all duration-300 group h-full">
                                            <div className="relative aspect-video overflow-hidden bg-muted">
                                                <img
                                                    src={item.news_image_url || '/placeholder.jpg'}
                                                    alt={item.news_title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <CardContent className="p-4 pt-0 space-y-2">
                                                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
                                                    {item.news_title || 'Tiêu đề không có sẵn'}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                                    {item.news_short_content || 'Nội dung không có sẵn'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Custom Beautiful Navigation Buttons */}
                        <button className="custom-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground group">
                            <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        </button>
                        <button className="custom-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground group">
                            <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>

                        {/* Custom Beautiful Pagination */}
                        <div className="custom-swiper-pagination flex justify-center items-center gap-2 mt-6"></div>
                    </div>
                )}
            </>
        )
    }



    if (isError) return (
        <div className="text-center py-8">
            <p className="text-muted-foreground">Không thể tải tin tức</p>
        </div>
    )

    return (
        <section className="space-y-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Tin Tức Mới Nhất</h2>
                </div>
                <Link
                    to="/tin-tuc"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                >
                    Xem tất cả
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            <NewsCarousel news={newsItems} />
        </section>
    )
}
