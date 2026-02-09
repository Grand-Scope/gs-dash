import { render, screen } from '@testing-library/react';
import LoginPage from '../page';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
}));

jest.mock('@/components/PasswordInput', () => ({
  PasswordInput: (props: any) => <input type="password" {...props} />,
}));

jest.mock('next-auth', () => ({
  AuthError: class extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
    }
  },
}));

describe('LoginPage', () => {
  it('renders login form correctly', async () => {
    // Mock params
    const searchParams = Promise.resolve({});
    
    // Call the async component
    const jsx = await LoginPage({ searchParams });
    
    render(jsx);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays error message when error param is present', async () => {
    const searchParams = Promise.resolve({ error: 'CredentialsSignin' });
    const jsx = await LoginPage({ searchParams });
    
    render(jsx);

    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
  });
});
