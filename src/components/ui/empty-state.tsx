import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-5">
      <Icon className="w-6 h-6 text-muted-foreground" />
    </div>
    <h3 className="text-base font-semibold mb-1.5">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
    <div className="flex items-center gap-3">
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="h-9 px-5">
          {actionLabel}
        </Button>
      )}
      {secondaryActionLabel && onSecondaryAction && (
        <Button variant="outline" size="sm" onClick={onSecondaryAction} className="h-9 px-5 border-border/40">
          {secondaryActionLabel}
        </Button>
      )}
    </div>
  </div>
);
