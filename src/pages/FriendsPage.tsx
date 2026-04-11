import { mockUsers } from "@/lib/mock-data";
import UserCard from "@/components/UserCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, UserPlus, ArrowDown, ArrowUp } from "lucide-react";

export default function FriendsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-page-title text-foreground">Друзья</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input placeholder="Найти друга..." className="pl-9 bg-card border-border/60 text-[14px]" />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full bg-card border border-border/60 card-shadow rounded-xl h-10 p-1">
          <TabsTrigger value="all" className="flex-1 text-[12px] gap-1.5 rounded-lg">
            <UserCheck className="h-3.5 w-3.5" />Мои друзья
          </TabsTrigger>
          <TabsTrigger value="incoming" className="flex-1 text-[12px] gap-1.5 rounded-lg">
            <ArrowDown className="h-3.5 w-3.5" />Входящие
            <span className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full font-bold">2</span>
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex-1 text-[12px] gap-1.5 rounded-lg">
            <ArrowUp className="h-3.5 w-3.5" />Исходящие
          </TabsTrigger>
          <TabsTrigger value="recommended" className="flex-1 text-[12px] gap-1.5 rounded-lg">
            <UserPlus className="h-3.5 w-3.5" />Рекомендации
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockUsers.slice(0, 6).map((user) => <UserCard key={user.id} user={user} />)}
          </div>
        </TabsContent>
        <TabsContent value="incoming" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockUsers.slice(3, 5).map((user) => <UserCard key={user.id} user={user} />)}
          </div>
        </TabsContent>
        <TabsContent value="outgoing" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockUsers.slice(1, 2).map((user) => <UserCard key={user.id} user={user} />)}
          </div>
        </TabsContent>
        <TabsContent value="recommended" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockUsers.slice(0, 10).map((user) => <UserCard key={user.id} user={user} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
