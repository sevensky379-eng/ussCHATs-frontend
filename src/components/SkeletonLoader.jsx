import React from 'react';

export const SkeletonLoader = ({ type = 'text', width = '100%', height = '20px', className = '' }) => {
  const baseStyles = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '4px',
  };

  const getStyles = () => {
    switch (type) {
      case 'circle':
        return {
          ...baseStyles,
          width: width,
          height: width,
          borderRadius: '50%',
        };
      case 'rectangle':
        return {
          ...baseStyles,
          width: width,
          height: height,
        };
      case 'text':
      default:
        return {
          ...baseStyles,
          width: width,
          height: height,
        };
    }
  };

  return (
    <div
      className={`skeleton-loader ${className}`}
      style={getStyles()}
    />
  );
};

export const ChatSkeleton = () => (
  <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <SkeletonLoader type="circle" width="40px" />
      <div style={{ flex: 1 }}>
        <SkeletonLoader width="120px" height="16px" style={{ marginBottom: '8px' }} />
        <SkeletonLoader width="200px" height="14px" />
      </div>
    </div>
  </div>
);

export const MessageSkeleton = () => (
  <div style={{ padding: '12px', display: 'flex', gap: '12px' }}>
    <SkeletonLoader type="circle" width="32px" />
    <div style={{ flex: 1 }}>
      <SkeletonLoader width="80px" height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonLoader width="60%" height="16px" style={{ marginBottom: '4px' }} />
      <SkeletonLoader width="40%" height="16px" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <SkeletonLoader type="circle" width="80px" style={{ margin: '0 auto 16px' }} />
    <SkeletonLoader width="120px" height="20px" style={{ margin: '0 auto 8px' }} />
    <SkeletonLoader width="100px" height="16px" style={{ margin: '0 auto' }} />
  </div>
);

// CSS for skeleton animation
const skeletonStyles = `
  @keyframes skeleton-loading {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = skeletonStyles;
  document.head.appendChild(styleSheet);
}