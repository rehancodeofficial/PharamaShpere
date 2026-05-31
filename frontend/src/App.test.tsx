import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the layout and default route', () => {
    render(<App />);
    
    // Check if the sidebar renders
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    
    // Check if the topbar renders
    expect(screen.getByText('Topbar')).toBeInTheDocument();
    
    // Check if the default dashboard route content renders
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
