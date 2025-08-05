import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const Marketplace = () => {
  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardContent className="p-12 text-center">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Marketplace Coming Soon</h2>
          <p className="text-muted-foreground">
            This section is being prepared for future features. 
            Strategy marketplace has been moved to the Strategies tab.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketplace;