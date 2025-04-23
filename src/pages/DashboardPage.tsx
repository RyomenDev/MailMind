
import EmailList from "../components/email/EmailList";
import EmailFilters from "../components/email/EmailFilters";

const DashboardPage = () => {
  return (
    <div className="container mx-auto">
      <EmailFilters />
      <EmailList />
    </div>
  );
};

export default DashboardPage;
