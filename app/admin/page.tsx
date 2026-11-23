import { FileText, Users, MessageSquare, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [articles, members, messages, users] = await Promise.all([
    prisma.article.count(),
    prisma.committeeMember.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.user.count(),
  ]);

  const stats = [
    { label: "Articles", value: articles, icon: FileText },
    { label: "Membres du comité", value: members, icon: Users },
    
    { label: "Utilisateurs", value: users, icon: UserCheck },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}