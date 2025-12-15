"use client";

import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/external/api";
import { UserType } from "@/lib/table-data-type";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AuthorizationToggleProps {
  userId: string;
  isAuthorized: boolean;
}

export function AuthorizationToggle({
  userId,
  isAuthorized,
}: AuthorizationToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticValue, setOptimisticValue] = useState(isAuthorized);
  const queryClient = useQueryClient();

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    setOptimisticValue(checked);

    try {
      await apiFetch(`/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_authorized: checked }),
      });

      await queryClient.invalidateQueries({ queryKey: [UserType.USERS] });

      toast.success(
        checked
          ? "Usuario autorizado exitosamente"
          : "Autorización del usuario revocada"
      );
    } catch (error) {
      setOptimisticValue(isAuthorized);

      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      
      try {
        const parsed = JSON.parse(errorMessage);
        toast.error(`Error al actualizar: ${parsed.message}`);
      } catch {
        toast.error(`Error al actualizar la autorización: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <Switch checked={optimisticValue} disabled />
      </div>
    );
  }

  return (
    <Switch
      checked={optimisticValue}
      onCheckedChange={handleToggle}
      disabled={isLoading}
      aria-label={`Toggle authorization for user`}
    />
  );
}
