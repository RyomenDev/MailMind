
import { Link } from "react-router-dom";
import { Inbox, Star, Mail } from "lucide-react";
import { useEmails } from "../../contexts/EmailContext";
import { cn } from "../../lib/utils";

const Sidebar = () => {
  const { filter, setFilter } = useEmails();

  const navItems = [
    {
      name: "Inbox",
      icon: Inbox,
      category: "inbox" as const,
    },
    {
      name: "Important",
      icon: Star,
      category: "important" as const,
    },
    {
      name: "All Mail",
      icon: Mail,
      category: "all" as const,
    },
  ];

  return (
    <aside className="w-64 bg-sidebar p-4 hidden md:block">
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-2xl font-bold text-brand-purple">
          <span className="text-brand-purple">Mail</span>
          <span>Minds</span>
        </h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.category}
            to="#"
            onClick={() => setFilter({ ...filter, category: item.category })}
            className={cn(
              "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              filter.category === item.category
                ? "bg-brand-purple text-white"
                : "text-muted-foreground hover:bg-secondary hover:text-brand-purple"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="px-4 py-2 text-xs text-muted-foreground">
          <p>© 2025 MailMinds</p>
          <p>AI-Powered Email</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
