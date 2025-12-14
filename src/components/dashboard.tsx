"use client";

import { Token } from "@/app/(authenticated)/tokens/columns";
import { User } from "@/app/(authenticated)/users/columns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/external/api";
import { UserType } from "@/lib/table-data-type";
import { useQuery } from "@tanstack/react-query";
import {
    Users,
    ShieldCheck,
    Cpu,
    Key,
    Activity,
    AlertCircle,
    Loader2,
    Zap
} from "lucide-react";


export function Dashboard() {
    const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
        queryKey: [UserType.USERS],
        queryFn: () =>
            apiFetch("/users/", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
    });

    const { data: tokens, isLoading: isLoadingTokens } = useQuery<Token[]>({
        queryKey: [UserType.TOKENS],
        queryFn: () =>
            apiFetch("/tokens/", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
    });
    console.log("tokens data:", tokens);

    if (isLoadingUsers || isLoadingTokens) {
        return (
            <div className="flex h-32 w-full">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const safeUsers = users || [];
    const safeTokens = tokens || [];

    const totalUsers = safeUsers.length;
    const authorizedUsers = safeUsers.filter((u) => u.is_authorized).length;
    const authPercentage = totalUsers > 0 ? (authorizedUsers / totalUsers) * 100 : 0;

    const modelDistribution = safeUsers.reduce((acc, user) => {
        acc[user.model_type] = (acc[user.model_type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const totalTokens = safeTokens.length;
    const activeTokens = safeTokens.filter((t) => t.is_active).length;

    const tokensWithLeadTime = safeTokens.filter((t) =>
        t.lead_time !== null && t.lead_time !== undefined
    );
    console.log("Tokens with lead time:", tokensWithLeadTime);
    const showLeadTimeCard = tokensWithLeadTime.length > 0;

    const avgLeadTime = showLeadTimeCard
        ? tokensWithLeadTime.reduce((acc, t) => acc + (t.lead_time!), 0) / tokensWithLeadTime.length
        : 0;

    const maxLeadTime = showLeadTimeCard
        ? Math.max(...tokensWithLeadTime.map(t => t.lead_time!))
        : 0;

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            <Card className="h-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Total Users</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {authorizedUsers} authorized ({authPercentage.toFixed(0)}%)
                    </p>
                    <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${authPercentage}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className="h-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Active Tokens</CardTitle>
                    <Key className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{activeTokens}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        out of {totalTokens} generated
                    </p>
                </CardContent>
            </Card>
            {showLeadTimeCard && (
                <Card className="h-full flex flex-col justify-between">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Avg. Latency</CardTitle>
                        <Zap className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {avgLeadTime.toFixed(2)}<span className="text-lg font-normal text-muted-foreground">s</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Processing time per request
                        </p>
                        <div className="mt-3 flex items-center text-xs text-muted-foreground bg-slate-50 p-1 rounded w-fit">
                            Max recorded: <span className="font-semibold ml-1">{maxLeadTime.toFixed(2)}s</span>
                        </div>
                    </CardContent>
                </Card>
            )}
            <Card className="h-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Model Usage</CardTitle>
                    <Cpu className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    {Object.entries(modelDistribution).map(([model, count]) => {
                        const percentage = (count / totalUsers) * 100;
                        return (
                            <div key={model} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-sm">{model}</span>
                                    <span className="text-muted-foreground">{count} users</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                    {totalUsers === 0 && <p className="text-sm text-muted-foreground">No data available</p>}
                </CardContent>
            </Card>
        </div>
    );
}