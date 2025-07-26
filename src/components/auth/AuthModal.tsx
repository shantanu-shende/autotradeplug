import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-background/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="sr-only">Authentication</DialogTitle>
        </DialogHeader>
        <AuthForm onSuccess={onAuthSuccess} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;