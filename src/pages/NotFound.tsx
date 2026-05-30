import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030305] text-[#F0F0F2] flex items-center justify-center">
      <div className="text-center">
        <Shield className="w-16 h-16 text-[#00F0FF]/20 mx-auto mb-6" />
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-lg text-[#8A8A93] font-mono mb-2">
          ROUTE_NOT_FOUND
        </p>
        <p className="text-sm text-[#8A8A93]/60 font-mono mb-8">
          The requested endpoint does not exist in the AEGIS network.
        </p>
        <Link to="/">
          <Button
            variant="outline"
            className="border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10 font-mono"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            RETURN_TO_BASE
          </Button>
        </Link>
      </div>
    </div>
  );
}
