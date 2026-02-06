
import { getChecklists, getReadinessScore } from "@/actions/preparedness";
import { PreparednessView } from "./preparedness-view";

export default async function PreparednessPage() {
  const checklists = await getChecklists();
  const score = await getReadinessScore();

  return (
    <div className="space-y-6">
      <PreparednessView checklists={checklists} readinessScore={score} />
    </div>
  );
}
