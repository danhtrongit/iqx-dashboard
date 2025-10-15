import AriXHubHoldTable from "@/components/charts/arix-hub-hold-table";
import { useArixHoldPositions } from "@/hooks/use-arix-hold";

export default function AriXHubHold() {
  // Fetch data from API
  const { data: arixData, isLoading } = useArixHoldPositions();

  return (
    <div className="space-y-6">
        <AriXHubHoldTable data={arixData?.positions || []} isLoading={isLoading} />
    </div>
  );
}

