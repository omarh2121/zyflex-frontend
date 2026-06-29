import DriverView from "@/components/odense/DriverView";
import LocationGate from "@/components/LocationGate";

export default function OdenseDriverPage() {
  const now = new Date();

  return (
    <LocationGate role="chauffør">
      <DriverView initialNowIso={now.toISOString()} />
    </LocationGate>
  );
}
