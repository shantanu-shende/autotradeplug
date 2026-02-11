import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, ShieldAlert, CheckCircle2, X } from "lucide-react";

const bannerVariants = cva(
  "flex items-start gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        info: "bg-primary/5 border border-primary/15 text-foreground",
        warning: "bg-[hsl(var(--warning))]/5 border border-[hsl(var(--warning))]/15 text-foreground",
        critical: "bg-destructive/5 border border-destructive/15 text-foreground",
        success: "bg-[hsl(var(--success))]/5 border border-[hsl(var(--success))]/15 text-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
  success: CheckCircle2,
};

const iconColorMap = {
  info: "text-primary",
  warning: "text-[hsl(var(--warning))]",
  critical: "text-destructive/80",
  success: "text-[hsl(var(--success))]",
};

export interface InlineBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const InlineBanner = React.forwardRef<HTMLDivElement, InlineBannerProps>(
  ({ className, variant = "info", title, children, dismissible, onDismiss, action, ...props }, ref) => {
    const Icon = iconMap[variant || "info"];
    const iconColor = iconColorMap[variant || "info"];

    return (
      <div
        ref={ref}
        className={cn(bannerVariants({ variant }), className)}
        {...props}
      >
        <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", iconColor)} />
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium text-sm mb-0.5">{title}</p>}
          <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
          {action && <div className="mt-2">{action}</div>}
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);
InlineBanner.displayName = "InlineBanner";

export { InlineBanner, bannerVariants };
