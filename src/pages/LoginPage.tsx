
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

const LoginPage = () => {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-brand-purple">Mail</span>
            <span>Minds</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Email Management
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Welcome</h2>
          <p className="mb-6 text-muted-foreground">
            Sign in with your Google account to access and manage your emails with AI-powered summaries and priority sorting.
          </p>
          
          <Button
            onClick={login}
            disabled={isLoading}
            className="w-full py-6"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                Connecting...
              </>
            ) : (
              "Sign in with Google"
            )}
          </Button>
          
          <p className="mt-4 text-xs text-muted-foreground">
            We only request read access to your emails to provide summaries and priorities.
            We never store your email content.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            © 2025 MailMinds • AI-Powered Email • Privacy-Focused
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
