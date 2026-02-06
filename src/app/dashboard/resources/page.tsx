
import { getResourceSummary, getResourceHistory } from "@/actions/resources";
import { ResourcesView } from "./resources-view";

export default async function ResourcesPage() {
  const summary = await getResourceSummary();
  const history = await getResourceHistory();

  return (
    <div className="space-y-6">
      <ResourcesView initialSummary={summary} initialHistory={history} />
    </div>
  );
}
