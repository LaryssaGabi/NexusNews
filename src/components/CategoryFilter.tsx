import { Rocket, Cpu, Globe } from "lucide-react";

type Category = "all" | "space" | "tech";

interface CategoryFilterProps {
  active: Category;
  onChange: (cat: Category) => void;
}

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Globe className="w-4 h-4" /> },
  { id: "space", label: "Space", icon: <Rocket className="w-4 h-4" /> },
  { id: "tech", label: "Tech", icon: <Cpu className="w-4 h-4" /> },
];

const CategoryFilter = ({ active, onChange }: CategoryFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === cat.id
              ? "bg-primary/15 text-primary border border-primary/30 glow-primary"
              : "bg-secondary/40 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
          }`}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
