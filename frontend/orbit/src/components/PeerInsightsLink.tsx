import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';

interface PeerInsightsLinkProps {
  variant?: 'button' | 'card' | 'inline';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function PeerInsightsLink({ 
  variant = 'button', 
  className = '', 
  showIcon = true,
  children 
}: PeerInsightsLinkProps) {
  const baseClasses = 'inline-flex items-center gap-2 transition-colors';
  
  const variantClasses = {
    button: 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium',
    card: 'p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md text-gray-700 hover:text-blue-600',
    inline: 'text-blue-600 hover:text-blue-800 underline text-sm'
  };

  const content = children || (
    <>
      {showIcon && <Users className="h-4 w-4" />}
      <span>View Peer Insights</span>
      {variant === 'card' && <ArrowRight className="h-4 w-4 ml-auto" />}
    </>
  );

  return (
    <Link 
      to="/peer-insights" 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {content}
    </Link>
  );
}

// Pre-configured variants for common use cases
export function PeerInsightsButton(props: Omit<PeerInsightsLinkProps, 'variant'>) {
  return <PeerInsightsLink {...props} variant="button" />;
}

export function PeerInsightsCard(props: Omit<PeerInsightsLinkProps, 'variant'>) {
  return (
    <PeerInsightsLink {...props} variant="card">
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0">
          <Users className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">Peer Insights</h3>
          <p className="text-sm text-gray-600">
            Compare your progress with fellow applicants
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
    </PeerInsightsLink>
  );
}

export function PeerInsightsInlineLink(props: Omit<PeerInsightsLinkProps, 'variant'>) {
  return <PeerInsightsLink {...props} variant="inline" />;
}
