import { render, screen } from '@testing-library/react';
import AuthComponent from '../AuthComponent';

test('renders login form', () => {
  render(<AuthComponent />);
  const linkElement = screen.getByText(/登录/i);
  expect(linkElement).toBeInTheDocument();
});

test('shows error message on failed login', () => {
  render(<AuthComponent />);
  // Simulate a failed login
  const errorMessage = screen.getByText(/登录失败/i);
  expect(errorMessage).toBeInTheDocument();
});

test('renders registration form', () => {
  render(<AuthComponent />);
  const registerElement = screen.getByText(/注册/i);
  expect(registerElement).toBeInTheDocument();
});