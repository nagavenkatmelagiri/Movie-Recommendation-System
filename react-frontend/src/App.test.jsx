import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders movie recommendation title', () => {
  render(<App />);
  const titleElement = screen.getByText(/movie recommendation system/i);
  expect(titleElement).toBeInTheDocument();
});
