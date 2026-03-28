import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNews, type Article, type FetchResult } from "@/services/api";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import SkeletonCard from "@/components/SkeletonCard";
import { Newspaper, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Category = "all" | "space" | "tech";

const BATCH = 20;

const Index = () => {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [spaceOffset, setSpaceOffset] = useState(0);
  const [techPage, setTechPage] = useState(1);
  const [hasMoreSpace, setHasMoreSpace] = useState(true);
  const [hasMoreTech, setHasMoreTech] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Initial load
  const { isLoading, isError } = useQuery<FetchResult>({
    queryKey: ["news", category, search],
    queryFn: async () => {
      const result = await fetchAllNews(category, search || undefined, 0, 1, BATCH);
      setArticles(result.articles);
      setSpaceOffset(BATCH);
      setTechPage(2);
      setHasMoreSpace(result.hasMoreSpace);
      setHasMoreTech(result.hasMoreTech);
      return result;
    },
    staleTime: 1000 * 60 * 5,
  });

  const hasMore =
    (category === "all" && (hasMoreSpace || hasMoreTech)) ||
    (category === "space" && hasMoreSpace) ||
    (category === "tech" && hasMoreTech);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const result = await fetchAllNews(
        category,
        search || undefined,
        spaceOffset,
        techPage,
        BATCH
      );
      setArticles(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newArticles = result.articles.filter(a => !existingIds.has(a.id));
        return [...prev, ...newArticles];
      });
      if (category !== "tech") setSpaceOffset(prev => prev + BATCH);
      if (category !== "space") setTechPage(prev => prev + 1);
      setHasMoreSpace(result.hasMoreSpace);
      setHasMoreTech(result.hasMoreTech);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [category, search, spaceOffset, techPage]);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-4 py-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Your <span className="text-gradient-primary">Space & Tech</span> News Hub
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Real-time aggregated news from spaceflight missions, launches, and the latest in technology innovation.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <CategoryFilter active={category} onChange={setCategory} />
          <SearchBar onSearch={setSearch} isLoading={isLoading} />
        </div>

        {articles.length > 0 && !isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Newspaper className="w-3.5 h-3.5" />
            <span>{articles.length} articles loaded</span>
          </div>
        )}

        {isError && (
          <div className="glass-card p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">Failed to load news. Please try again.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : articles.map((article, i) => (
                <NewsCard key={article.id} article={article} index={i} />
              ))}
          {loadingMore &&
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
        </div>

        {!isLoading && hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={loadMore}
              disabled={loadingMore}
              className="font-mono gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </>
              ) : (
                <>Load more articles</>
              )}
            </Button>
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <Newspaper className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground text-sm">No articles found. Try a different search or category.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-border/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground font-mono">
          Powered by Spaceflight News API & APITube · Built with React + TypeScript + Tailwind
        </div>
      </footer>
    </div>
  );
};

export default Index;
