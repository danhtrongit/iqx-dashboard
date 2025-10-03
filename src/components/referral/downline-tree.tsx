import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronDown, Users, TrendingUp, Mail, Calendar } from "lucide-react";
import { useDownlineTree, useTotalDownlineCount } from "@/hooks/use-referral";
import { formatCurrency } from "@/lib/utils";
import type { DownlineNode } from "@/types/referral";

export function DownlineTree() {
  const { data: tree, isLoading } = useDownlineTree();
  const { data: totalDownline, isLoading: isLoadingTotal } = useTotalDownlineCount();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!tree) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="size-5" />
              Hệ thống phân cấp
            </CardTitle>
            <CardDescription className="text-sm">
              Tổng {totalDownline || 0} thành viên trong hệ thống
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tree.children && tree.children.length > 0 ? (
          <div className="space-y-1">
            {tree.children.map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="size-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Chưa có thành viên cấp dưới</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TreeNode({ node, depth = 0 }: { node: DownlineNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels

  const hasChildren = node.children && node.children.length > 0;
  const indentClass = `ml-${Math.min(depth * 4, 16)}`;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors ${
          depth > 0 ? "ml-6" : ""
        }`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        ) : (
          <div className="size-6" />
        )}

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{node.displayName || node.email}</span>
            <Badge variant="outline" className="text-xs shrink-0">
              cấp {node.level + 1}
            </Badge>
            {node.childrenCount > 0 && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {node.childrenCount} người
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Mail className="size-3" />
              {node.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="size-3" />
              {formatCurrency(node.totalCommission)}
            </span>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

