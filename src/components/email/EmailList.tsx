
import { motion } from "framer-motion";
import { Email } from "../../types";
import EmailCard from "./EmailCard";
import { useEmails } from "../../contexts/EmailContext";

const EmailList = () => {
  const { filteredEmails, isLoading, error, markAsImportant } = useEmails();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-brand-purple border-r-brand-purple border-b-transparent border-l-transparent"></div>
          <div className="mt-4 text-lg font-medium">Loading emails...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-destructive">
          <div className="text-lg font-medium">Error</div>
          <div className="mt-1">{error}</div>
        </div>
      </div>
    );
  }

  if (filteredEmails.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <div className="text-lg font-medium">No emails found</div>
          <div className="mt-1">Try adjusting your search or filters</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div layout>
      {filteredEmails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          onMarkImportant={markAsImportant}
        />
      ))}
    </motion.div>
  );
};

export default EmailList;
