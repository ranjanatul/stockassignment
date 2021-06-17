import { render, screen } from '@testing-library/react';
import ErrorMsg from './ErrorMsg';

test('renders learn react link', () => {
  render(<ErrorMsg err="This is an error" />);
  const linkElement = screen.getByText(/This is an error/i);
  expect(linkElement).toBeInTheDocument();
});
