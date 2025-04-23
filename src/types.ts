export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  accessToken: string;
}

export interface Email {
  id: string;
  threadId: string;
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  snippet: string;
  body: string;
  receivedAt: Date;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  priority: Priority;
  summary?: string;
}

export type Priority = "high" | "medium" | "low";

export interface EmailFilter {
  search: string;
  priority: Priority | "all";
  category: "inbox" | "important" | "all";
}

// export interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: () => Promise<void>;
//   logout: () => void;
// }

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isGapiInitialized: boolean;
}
