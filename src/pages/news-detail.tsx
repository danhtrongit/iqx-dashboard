import { useParams, useNavigate, Link } from 'react-router-dom'
import { useNewsFromSlug, useRelatedNews, useReadingProgress } from '@/hooks/use-news'
import { NewsService } from '@/services/news-detail.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Clock, ExternalLink, Share2, Eye, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: article, isLoading, error } = useNewsFromSlug(slug!, 'vi', {
    enabled: !!slug && NewsService.isValidSlug(slug),
  })

  const { data: relatedArticles = [] } = useRelatedNews(article?.id || '', {
    enabled: !!article?.id,
    limit: 4,
  })

  const readingProgress = useReadingProgress(article?.id || '', slug || '')

  if (isLoading) {
    return <NewsDetailSkeleton />
  }

  if (error || !article) {
    return <NewsNotFound slug={slug} error={error} />
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.news_title,
          text: article.summary,
          url: window.location.href,
        })
      } catch (error) {
        fallbackShare()
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = () => {
    navigator.clipboard.writeText(window.location.href)
    // You could show a toast notification here
  }

  const handleTickerClick = (ticker: string) => {
    navigate(`/co-phieu/${ticker}`)
  }

  const readingTime = NewsService.calculateReadingTime(article.news_full_content)
  const formattedDate = format(new Date(article.update_date), 'dd MMMM yyyy, HH:mm', {
    locale: vi,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      {readingProgress.progressPercentage > 5 && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${readingProgress.progressPercentage}%` }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        {/* Article Header */}
        <article className="space-y-6">
          <header className="space-y-4">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.update_date}>{formattedDate}</time>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{readingTime} phút đọc</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>Đọc: {readingProgress.progressPercentage.toFixed(0)}%</span>
              </div>

              <Badge variant="outline" className="ml-auto">
                {article.news_from_name}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {article.news_title}
            </h1>

            {/* Ticker and Company Info */}
            {article.ticker && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTickerClick(article.ticker)}
                  className="font-semibold"
                >
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {article.ticker}
                </Button>

                {article.company_name && (
                  <span className="text-sm text-muted-foreground">
                    {article.company_name}
                  </span>
                )}

                {article.industry && (
                  <Badge variant="secondary" className="text-xs">
                    {article.industry}
                  </Badge>
                )}
              </div>
            )}

            {/* Summary */}
            {article.summary && (
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-lg leading-relaxed font-medium text-muted-foreground">
                  {article.summary}
                </p>
              </div>
            )}

            {/* Sentiment and Score */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tâm lý thị trường:</span>
                <Badge className={NewsService.getSentimentColor(article.sentiment)}>
                  {article.sentiment === 'Positive' ? 'Tích cực' :
                   article.sentiment === 'Negative' ? 'Tiêu cực' : 'Trung tính'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Điểm:</span>
                <Badge variant="outline" className="font-bold">
                  {article.score}/10
                </Badge>
              </div>

              <Button variant="outline" size="sm" onClick={handleShare} className="ml-auto">
                <Share2 className="mr-1 h-4 w-4" />
                Chia sẻ
              </Button>
            </div>

            <Separator />
          </header>

          {/* Featured Image */}
          {article.news_image_url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={article.news_image_url}
                alt={article.news_title}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: article.news_full_content }}
              className="leading-relaxed"
            />
          </div>

          {/* Article Footer */}
          <footer className="space-y-4 pt-8 border-t">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-muted-foreground">Nguồn:</span>

              <a
                href={article.news_source_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {article.news_from_name}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Highlight Position */}
            {article.highlight_position && (
              <div className="bg-primary/5 border-l-4 border-primary pl-4 py-2">
                <p className="text-sm font-medium text-primary">
                  Điểm nhấn: {article.highlight_position}
                </p>
              </div>
            )}
          </footer>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Bài viết liên quan</h2>

            <div className="grid gap-6 md:grid-cols-2">
              {relatedArticles.map((relatedArticle) => (
                <Card key={relatedArticle.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <Link to={`/tin-tuc/${relatedArticle.slug}`}>
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={relatedArticle.news_image_url}
                        alt={relatedArticle.news_title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>

                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {relatedArticle.ticker}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {NewsService.formatNewsDate(relatedArticle.update_date)}
                        </span>
                      </div>

                      <CardTitle className="text-lg line-clamp-2">
                        {relatedArticle.news_title}
                      </CardTitle>

                      <CardDescription className="line-clamp-2">
                        {relatedArticle.news_short_content}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function NewsDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Skeleton className="h-10 w-24 mb-6" />

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>

          <Skeleton className="h-16 w-full" />

          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-48" />
          </div>

          <Skeleton className="h-24 w-full" />
        </div>

        <Skeleton className="aspect-video w-full" />

        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}

function NewsNotFound({ slug, error }: { slug?: string, error: any }) {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">
            Không tìm thấy bài viết
          </CardTitle>
          <CardDescription className="text-lg">
            {error?.statusCode === 404
              ? `Bài viết với slug "${slug}" không tồn tại hoặc đã bị xóa.`
              : 'Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="space-x-4">
            <Button onClick={() => navigate('/tin-tuc')}>
              Về trang tin tức
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}