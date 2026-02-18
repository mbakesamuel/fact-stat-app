import { Card } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="h-full grid grid-rows-4 gap-4 m-8">
      <div>
        <Card className="h-full"></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Card className="h-full"></Card></div>
        <div><Card className="h-full"></Card></div>
        <div><Card className="h-full"></Card></div>
      </div>
    </div>
  );
}
