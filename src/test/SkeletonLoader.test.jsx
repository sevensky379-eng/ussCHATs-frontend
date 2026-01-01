import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from '../components/SkeletonLoader';

describe('SkeletonLoader', () => {
  test('renders with default props', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('skeleton-loader');
  });

  test('renders with custom width and height', () => {
    render(<SkeletonLoader width="200px" height="50px" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
  });

  test('renders circle variant', () => {
    render(<SkeletonLoader type="circle" width="40px" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle({
      width: '40px',
      height: '40px',
      borderRadius: '50%'
    });
  });

  test('renders rectangle variant', () => {
    render(<SkeletonLoader type="rectangle" width="100px" height="20px" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle({
      width: '100px',
      height: '20px',
      borderRadius: '4px'
    });
  });

  test('applies custom className', () => {
    render(<SkeletonLoader className="custom-skeleton" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('skeleton-loader', 'custom-skeleton');
  });
});