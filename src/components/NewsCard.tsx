import { motion } from "framer-motion";
import { ExternalLink, Clock, Rocket, Cpu } from "lucide-react";
import type { Article } from "@/services/api";

interface NewsCardProps {
  article: Article;
  index: number;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const NewsCard = ({ article, index }: NewsCardProps) => {
  const CategoryIcon = article.category === "space" ? Rocket : Cpu;

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="group glass-card overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-300 hover:glow-primary"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-secondary">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <CategoryIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md ${
              article.category === "space"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-accent/20 text-accent border border-accent/30"
            }`}
          >
            <CategoryIcon className="w-3 h-3" />
            {article.category === "space" ? "Space" : "Tech"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
          {article.summary}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono truncate max-w-[120px]">{article.source}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(article.publishedAt)}
            </span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </motion.a>
  );
};

export default NewsCard;
