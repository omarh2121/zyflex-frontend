import DriverView from "@/components/odense/DriverView";

export default function OdenseDriverPage() {
  const now = new Date();

  return <DriverView initialNowIso={now.toISOString()} />;
}
