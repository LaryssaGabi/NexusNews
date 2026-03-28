export interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  url: string;
  source: string;
  publishedAt: string;
  category: "space" | "tech";
}

const APITUBE_KEY = "api_live_cFmqMNkf6jl923Jf8X4SzikdZVuOGLYllAHOrNOefHOfPHZmx";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// Spaceflight News API (free, no key) — supports offset pagination
export async function fetchSpaceNews(search?: string, limit = 20, offset = 0): Promise<{ articles: Article[]; hasMore: boolean }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset), ordering: "-published_at" });
  if (search) params.set("search", search);

  const res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?${params}`);
  if (!res.ok) throw new Error("Failed to fetch space news");
  const data = await res.json();

  const articles: Article[] = (data.results || []).map((item: any) => ({
    id: `space-${item.id}`,
    title: item.title,
    summary: item.summary || "",
    imageUrl: item.image_url || null,
    url: item.url,
    source: item.news_site || "Spaceflight News",
    publishedAt: item.published_at,
    category: "space" as const,
  }));

  return { articles, hasMore: !!data.next };
}

// APITube Tech News — uses CORS proxy for browser access
export async function fetchTechNews(search?: string, limit = 20, page = 1): Promise<{ articles: Article[]; hasMore: boolean }> {
  const params = new URLSearchParams({
    "topic.id": "industry.technology_news",
    per_page: String(limit),
    page: String(page),
    language: "en",
  });
  if (search) params.set("q", search);

  const targetUrl = `https://api.apitube.io/v1/news/everything?${params}`;
  
  // Try direct first, fall back to CORS proxy
  let res: Response;
  try {
    res = await fetch(targetUrl, {
      headers: { "X-API-Key": APITUBE_KEY },
    });
  } catch {
    // CORS blocked — use proxy (key goes in query param since we can't set headers through proxy)
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${targetUrl}&api_key=${APITUBE_KEY}`)}`;
    res = await fetch(proxyUrl);
  }

  if (!res.ok) throw new Error("Failed to fetch tech news");
  const data = await res.json();

  const results = data.results || data.articles || [];
  const articles: Article[] = results.map((item: any, i: number) => ({
    id: `tech-${item.id || `${page}-${i}`}`,
    title: item.title,
    summary: item.description || item.body?.substring(0, 200) || "",
    imageUrl: item.image || null,
    url: item.href || item.url || "",
    source: item.source?.name || item.source?.domain || "Tech News",
    publishedAt: item.published_at || new Date().toISOString(),
    category: "tech" as const,
  }));

  return { articles, hasMore: articles.length >= limit };
}

export interface FetchResult {
  articles: Article[];
  hasMoreSpace: boolean;
  hasMoreTech: boolean;
}

export async function fetchAllNews(
  category: "all" | "space" | "tech" = "all",
  search?: string,
  spaceOffset = 0,
  techPage = 1,
  limit = 20
): Promise<FetchResult> {
  let spaceResult = { articles: [] as Article[], hasMore: false };
  let techResult = { articles: [] as Article[], hasMore: false };

  const fetchers: Promise<void>[] = [];

  if (category === "all" || category === "space") {
    fetchers.push(
      fetchSpaceNews(search, limit, spaceOffset)
        .then(r => { spaceResult = r; })
        .catch(() => {})
    );
  }
  if (category === "all" || category === "tech") {
    fetchers.push(
      fetchTechNews(search, limit, techPage)
        .then(r => { techResult = r; })
        .catch(() => {})
    );
  }

  await Promise.all(fetchers);

  const articles = [...spaceResult.articles, ...techResult.articles];
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    articles,
    hasMoreSpace: spaceResult.hasMore,
    hasMoreTech: techResult.hasMore,
  };
}
