
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEmails } from "../../contexts/EmailContext";
import { Priority } from "../../types";

const EmailFilters = () => {
  const { filter, setFilter } = useEmails();

  const handlePriorityChange = (value: string) => {
    setFilter({ ...filter, priority: value as Priority | 'all' });
  };

  const resetFilters = () => {
    setFilter({ search: "", priority: "all", category: filter.category });
  };

  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div className="text-lg font-semibold">
        {filter.category === "inbox" && "Inbox"}
        {filter.category === "important" && "Important Emails"}
        {filter.category === "all" && "All Mail"}
        
        {filter.search && (
          <span className="text-muted-foreground ml-2 text-sm">
            Search results for "{filter.search}"
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Select value={filter.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default EmailFilters;
