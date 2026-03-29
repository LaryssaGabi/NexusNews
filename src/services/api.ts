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

const GNEWS_KEY = "64a8a7d4bc18d12474a1dd86d3f83d92";

function getFallbackImage(category: "space" | "tech", title: string): string {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (hash % 1000) + 1;
  return `https://picsum.photos/seed/${seed}/400/250`;
}

const BLOCKED_KEYWORDS = [
  "drowns", "murder", "flood", "police", "arrest",
  "election", "killed", "hospital", "celebrity",
  "actor", "actress", "wedding", "stabbing", "robbery",
];

export async function fetchSpaceNews(
  search?: string,
  limit = 20,
  offset = 0
): Promise<{ articles: Article[]; hasMore: boolean }> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ordering: "-published_at",
  });
  if (search) params.set("search", search);

  const res = await fetch(
    `https://api.spaceflightnewsapi.net/v4/articles/?${params}`
  );
  if (!res.ok) throw new Error("Failed to fetch space news");
  const data = await res.json();

  const articles: Article[] = (data.results || []).map((item: any) => ({
    id: `space-${item.id}`,
    title: item.title,
    summary: item.summary || "",
    imageUrl: item.image_url || getFallbackImage("space", item.title),
    url: item.url,
    source: item.news_site || "Spaceflight News",
    publishedAt: item.published_at,
    category: "space" as const,
  }));

  return { articles, hasMore: !!data.next };
}

export async function fetchTechNews(
  search?: string,
  limit = 10,
  page = 1
): Promise<{ articles: Article[]; hasMore: boolean }> {
  const query = search
    ? `${search} technology`
    : `AI OR software OR cybersecurity OR smartphone OR semiconductor OR startup OR "machine learning" OR cryptocurrency OR programming`;

  const fetchPage = async (p: number) => {
    const params = new URLSearchParams({
      lang: "en",
      max: "10",
      page: String(p),
      apikey: GNEWS_KEY,
      q: query,
      in: "title",
    });
    const res = await fetch(`https://gnews.io/api/v4/search?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles || [];
  };

  const [batch1, batch2] = await Promise.all([
    fetchPage(page * 2 - 1),
    fetchPage(page * 2),
  ]);

  const results = [...batch1, ...batch2];

  const filtered = results.filter((item: any) => {
    const title = (item.title || "").toLowerCase();
    return !BLOCKED_KEYWORDS.some(kw => title.includes(kw));
  });

  const articles: Article[] = filtered.map((item: any, i: number) => ({
    id: `tech-${page}-${i}-${item.publishedAt}`,
    title: item.title,
    summary: item.description || "",
    imageUrl: item.image || getFallbackImage("tech", item.title),
    url: item.url,
    source: item.source?.name || "Tech News",
    publishedAt: item.publishedAt,
    category: "tech" as const,
  }));

  const seen = new Set<string>();
  const unique = articles.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  return { articles: unique, hasMore: unique.length >= 10 };
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
  let techResult  = { articles: [] as Article[], hasMore: false };

  const fetchers: Promise<void>[] = [];

  if (category === "all" || category === "space") {
    fetchers.push(
      fetchSpaceNews(search, limit, spaceOffset)
        .then(r  => { spaceResult = r; })
        .catch(e => console.error("[Space]", e))
    );
  }

  if (category === "all" || category === "tech") {
    fetchers.push(
      fetchTechNews(search, 10, techPage)
        .then(r  => { techResult = r; })
        .catch(e => console.error("[GNews]", e))
    );
  }

  await Promise.all(fetchers);

  let combined: Article[] = [];
  if (category === "all")   combined = [...spaceResult.articles, ...techResult.articles];
  if (category === "space") combined = spaceResult.articles;
  if (category === "tech")  combined = techResult.articles;

  combined.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return {
    articles: combined,
    hasMoreSpace: spaceResult.hasMore,
    hasMoreTech:  techResult.hasMore,
  };
}