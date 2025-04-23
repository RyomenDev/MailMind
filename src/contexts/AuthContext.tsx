import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType } from "../types";

// Auth Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  isGapiInitialized: false,
});

// Constants
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
];

interface AuthProviderProps {
  children: ReactNode;
}

// Initialize Gmail Client
const initGmailClient = async () => {
  await window.gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  });
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGapiInitialized, setIsGapiInitialized] = useState<boolean>(false);

  // Restore session from sessionStorage
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("access_token");
        if (token) {
          const res = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const profile = await res.json();
          setUser({
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            profilePicture: profile.picture,
            accessToken: token,
          });
        }
      } catch (error) {
        console.error("Error checking saved session:", error);
      }
      setIsLoading(false);
    };

    initialize();
  }, []);

  // Load Google API and initialize Gmail client
  useEffect(() => {
    const loadGapiAndInitClient = async () => {
      setIsLoading(true);

      try {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://apis.google.com/js/api.js";
          script.onload = () => {
            window.gapi.load("client:auth2", async () => {
              await initGmailClient();

              if (!window.gapi.auth2.getAuthInstance()) {
                await window.gapi.auth2.init({
                  client_id: CLIENT_ID,
                  scope: SCOPES,
                });
              }

              resolve();
            });
          };
          document.body.appendChild(script);
        });

        // Check login state
        const auth2 = window.gapi.auth2.getAuthInstance();
        if (auth2.isSignedIn.get()) {
          const googleUser = auth2.currentUser.get();
          const profile = googleUser.getBasicProfile();
          const authResponse = googleUser.getAuthResponse();

          setUser({
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            profilePicture: profile.getImageUrl(),
            accessToken: authResponse.access_token,
          });

          sessionStorage.setItem("access_token", authResponse.access_token);
        }

        setIsGapiInitialized(true);
      } catch (error) {
        console.error("Error initializing Google API:", error);
        setIsGapiInitialized(false);
      }

      setIsLoading(false);
    };

    loadGapiAndInitClient();
  }, []);

  // Login function
  const login = async () => {
    setIsLoading(true);

    try {
      window.google.accounts.oauth2
        .initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.error("Token error:", tokenResponse);
              setIsLoading(false);
              return;
            }

            const accessToken = tokenResponse.access_token;
            sessionStorage.setItem("access_token", accessToken);

            const res = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            const profile = await res.json();
            setUser({
              id: profile.sub,
              name: profile.name,
              email: profile.email,
              profilePicture: profile.picture,
              accessToken,
            });
            setIsLoading(false);
          },
        })
        .requestAccessToken();
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    sessionStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isGapiInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => useContext(AuthContext);


