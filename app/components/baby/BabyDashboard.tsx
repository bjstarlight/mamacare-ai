import VaccinationSchedule from "./VaccinationSchedule";
import GrowthTracker from "./GrowthTracker";
import AIPediatricAssistant from "./AIPediatricAssistant";

export default function BabyDashboard() {
  return (
    <div className="space-y-6">
      <VaccinationSchedule />
      <GrowthTracker />
      <AIPediatricAssistant />
    </div>
  );
}
