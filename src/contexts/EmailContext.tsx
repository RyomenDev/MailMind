import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Email, EmailFilter, Priority, User } from "../types";
import { fetchEmails } from "../utils/gmailAPI";
import { useAuth } from "./AuthContext";

interface EmailContextType {
  emails: Email[];
  filteredEmails: Email[];
  isLoading: boolean;
  error: string | null;
  filter: EmailFilter;
  setFilter: (filter: EmailFilter) => void;
  refreshEmails: () => Promise<void>;
  markAsImportant: (id: string) => void;
}

const EmailContext = createContext<EmailContextType>({
  emails: [],
  filteredEmails: [],
  isLoading: false,
  error: null,
  filter: { search: "", priority: "all", category: "inbox" },
  setFilter: () => {},
  refreshEmails: async () => {},
  markAsImportant: () => {},
});

interface EmailProviderProps {
  children: ReactNode;
}

export const EmailProvider = ({ children }: EmailProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EmailFilter>({
    search: "",
    priority: "all",
    category: "inbox",
  });

  // Fetch emails when the user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadEmails(user);
    }
  }, [isAuthenticated, user]);

  // Filter emails when the filter or emails change
  useEffect(() => {
    filterEmails();
  }, [emails, filter]);

  // Load emails from the API
  const loadEmails = async (user: User): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      //   console.log("fetching emails",user.accessToken);

      const fetchedEmails = await fetchEmails(user.accessToken);
    //   console.log("after fetch", { fetchedEmails });

      setEmails(fetchedEmails);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching emails:", error);
      setError("Failed to fetch emails. Please try again.");
      setIsLoading(false);
    }
  };

  // Refresh emails
  const refreshEmails = async (): Promise<void> => {
    if (!user) return;
    await loadEmails(user);
  };

  // Mark an email as important (high priority)
  const markAsImportant = (id: string): void => {
    setEmails((prevEmails) =>
      prevEmails.map((email) =>
        email.id === id ? { ...email, priority: "high" } : email
      )
    );
  };

  // Filter emails based on the current filters
  const filterEmails = (): void => {
    let filtered = [...emails];

    // Filter by priority
    if (filter.priority !== "all") {
      filtered = filtered.filter((email) => email.priority === filter.priority);
    }

    // Filter by category
    if (filter.category === "important") {
      filtered = filtered.filter((email) => email.priority === "high");
    }

    // Filter by search term
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(searchLower) ||
          email.sender.name.toLowerCase().includes(searchLower) ||
          email.sender.email.toLowerCase().includes(searchLower) ||
          email.body.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEmails(filtered);
  };

  return (
    <EmailContext.Provider
      value={{
        emails,
        filteredEmails,
        isLoading,
        error,
        filter,
        setFilter,
        refreshEmails,
        markAsImportant,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

// Custom hook for using the email context
export const useEmails = () => useContext(EmailContext);
