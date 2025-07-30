import React from 'react';
import Lottie from 'lottie-react';

interface LoadingScreenProps {
  message?: string;
}

// Simple loading animation data for trading/financial theme
const loadingAnimationData = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: "Loading",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { 
          a: 1, 
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [0] },
            { t: 120, s: [360] }
          ]
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [80, 80] }
            },
            {
              ty: "st",
              c: { a: 0, k: [0.2, 0.8, 0.4, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 120,
      st: 0
    }
  ]
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Signing you in..." 
}) => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Logo placeholder */}
        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mb-8">
          <div className="w-8 h-8 bg-primary rounded opacity-80"></div>
        </div>
        
        {/* Lottie Animation */}
        <div className="w-32 h-32 mx-auto">
          <Lottie 
            animationData={loadingAnimationData}
            loop={true}
            autoplay={true}
          />
        </div>
        
        {/* Loading message */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">Please wait a moment...</p>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;