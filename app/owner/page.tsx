import OwnerDashboard from "@/components/owner/OwnerDashboard";
import LocationGate from "@/components/LocationGate";

export default function OwnerPage() {
  return (
    <LocationGate role="ejer">
      <OwnerDashboard />
    </LocationGate>
  );
}
