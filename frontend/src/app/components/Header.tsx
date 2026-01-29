import { ChevronDown, Circle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

interface HeaderProps {
  selectedSpecies: string;
  onSpeciesChange: (species: string) => void;
}

export function Header({ selectedSpecies, onSpeciesChange }: HeaderProps) {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-teal-500/20 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">AquaNova</h1>
      </div>

      {/* Status and Species Selector */}
      <div className="flex items-center gap-6">
        {/* System Status */}
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-pulse" />
          <span className="text-sm text-emerald-400 font-medium">System Status: Online</span>
        </div>

        {/* Species Selector */}
        <Select value={selectedSpecies} onValueChange={onSpeciesChange}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-teal-500/30 text-white">
            <SelectValue placeholder="Select species" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-teal-500/30">
            <SelectItem value="tilapia" className="text-white">Tilapia</SelectItem>
            <SelectItem value="catla" className="text-white">Catla</SelectItem>
            <SelectItem value="shrimp" className="text-white">Shrimp</SelectItem>
            <SelectItem value="salmon" className="text-white">Salmon</SelectItem>
            <SelectItem value="carp" className="text-white">Carp</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}