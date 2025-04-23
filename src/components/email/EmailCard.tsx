
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Email } from "../../types";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { Separator } from "../ui/separator";

interface EmailCardProps {
  email: Email;
  onMarkImportant: (id: string) => void;
}

const EmailCard = ({ email, onMarkImportant }: EmailCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-priority-high";
      case "medium":
        return "bg-priority-medium";
      case "low":
        return "bg-priority-low";
      default:
        return "bg-muted";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Normal";
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card
        className={cn(
          "mb-4 transition-shadow hover:shadow-md",
          !email.isRead && "border-l-4 border-l-brand-purple"
        )}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-brand-purple-light flex items-center justify-center text-brand-purple font-bold">
                {email.sender.name ? email.sender.name[0].toUpperCase() : "?"}
              </div>
              <div>
                <div className="font-medium">{email.sender.name || email.sender.email}</div>
                <div className="text-xs text-muted-foreground">{email.sender.email}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={cn(getPriorityColor(email.priority), "text-white")}>
                {getPriorityLabel(email.priority)}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {format(email.receivedAt, "MMM dd, h:mm a")}
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-2">{email.subject}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-sm">
            {email.summary || email.snippet || "No summary available"}
          </div>
          
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <Separator className="my-2" />
              <div className="text-sm whitespace-pre-line mt-2 bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                {email.body}
              </div>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button variant="ghost" size="sm" onClick={toggleExpanded}>
            {expanded ? "Show Less" : "Read More"}
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onMarkImportant(email.id)}
              className={cn(
                email.isStarred || email.priority === "high"
                  ? "text-priority-high"
                  : "text-muted-foreground"
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  email.isStarred || email.priority === "high" && "fill-priority-high"
                )}
              />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EmailCard;
