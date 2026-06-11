import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Piki Ora home page', () => {
  render(<App />);
  const heading = screen.getByRole('heading', {name: /Piki Ora 7420/i});
  expect(heading).toBeInTheDocument();
});
