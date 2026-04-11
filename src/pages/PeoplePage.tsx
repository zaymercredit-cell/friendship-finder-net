import { mockUsers, allInterests, cities } from "@/lib/mock-data";
import UserCard from "@/components/UserCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PeoplePage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Поиск людей</h1>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Имя или никнейм..." className="pl-9 bg-card border-border" />
        </div>
        <Button
          variant={showFilters ? "default" : "secondary"}
          size="icon"
          className="shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card rounded-lg border border-border shadow-card p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Фильтры</h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { setSelectedInterests([]); }}>
              Сбросить
            </Button>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Город</Label>
            <Select>
              <SelectTrigger className="bg-secondary border-0">
                <SelectValue placeholder="Любой город" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Интересы</Label>
            <div className="flex flex-wrap gap-1.5">
              {allInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "secondary"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                  {selectedInterests.includes(interest) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="company" />
              <Label htmlFor="company" className="text-xs">Ищет компанию</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="online" />
              <Label htmlFor="online" className="text-xs">Онлайн</Label>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mockUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
