import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, AlertTriangle, CheckCircle, TrendingUp, Eye, ExternalLink } from 'lucide-react';

interface Notification {
  id: string;
  type: 'trade' | 'strategy' | 'portfolio' | 'system';
  title: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNotificationClick
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'strategy': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'portfolio': return <Eye className="h-4 w-4 text-warning" />;
      default: return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium': return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      default: return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Notification Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50"
          >
            <Card className="h-full rounded-none glass-panel border-l">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
                      Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
                <div className="p-4 space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">All caught up!</h4>
                      <p className="text-muted-foreground">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onNotificationClick(notification)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          notification.status === 'unread' 
                            ? 'bg-primary/5 border-primary/20' 
                            : 'bg-background border-border'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-medium truncate">
                                {notification.title}
                              </h5>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </span>
                              {notification.actionLabel && (
                                <Button variant="ghost" size="sm" className="h-6 text-xs">
                                  {notification.actionLabel}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {notification.status === 'unread' && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationOverlay;