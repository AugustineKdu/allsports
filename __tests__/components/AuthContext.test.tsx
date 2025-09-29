import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, withAuth } from '@/components/AuthContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component to access AuthContext
function TestComponent() {
  const { user, token, login, logout, setUser, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="user">{user ? user.username : 'No user'}</div>
      <div data-testid="token">{token || 'No token'}</div>
      <button
        onClick={() => login(
          {
            id: '1',
            email: 'test@example.com',
            username: '테스트유저',
            city: '서울',
            district: '강남구',
            currentSport: '축구',
            isAdmin: false
          },
          'test-token'
        )}
        data-testid="login"
      >
        Login
      </button>
      <button onClick={logout} data-testid="logout">
        Logout
      </button>
      <button
        onClick={() => setUser({
          id: '1',
          email: 'updated@example.com',
          username: '업데이트유저',
          city: '부산',
          district: '해운대구',
          currentSport: '풋살',
          isAdmin: false
        })}
        data-testid="update-user"
      >
        Update User
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should provide default values when no user is logged in', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('No token');
  });

  it('should restore user and token from localStorage on mount', async () => {
    const mockUser = {
      id: '1',
      email: 'stored@example.com',
      username: '저장된유저',
      city: '서울',
      district: '강남구',
      currentSport: '축구',
      isAdmin: false
    };

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'token') return 'stored-token';
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('저장된유저');
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
  });

  it('should handle corrupted localStorage data gracefully', async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return 'invalid-json';
      if (key === 'token') return 'stored-token';
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('No token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should login and store user data', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    act(() => {
      screen.getByTestId('login').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('테스트유저');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({
      id: '1',
      email: 'test@example.com',
      username: '테스트유저',
      city: '서울',
      district: '강남구',
      currentSport: '축구',
      isAdmin: false
    }));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
  });

  it('should logout and clear user data', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // First login
    act(() => {
      screen.getByTestId('login').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('테스트유저');

    // Then logout
    act(() => {
      screen.getByTestId('logout').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('No token');

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should update user data', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // First login
    act(() => {
      screen.getByTestId('login').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('테스트유저');

    // Update user
    act(() => {
      screen.getByTestId('update-user').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('업데이트유저');

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({
      id: '1',
      email: 'updated@example.com',
      username: '업데이트유저',
      city: '부산',
      district: '해운대구',
      currentSport: '풋살',
      isAdmin: false
    }));
  });
});

describe('withAuth HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  // Note: Loading state test is difficult to capture due to async useEffect
  // The loading state transitions too quickly in the test environment

  it('should show login prompt when not authenticated', async () => {
    const TestWrappedComponent = withAuth(() => <div>Protected Content</div>);

    render(
      <AuthProvider>
        <TestWrappedComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('로그인이 필요합니다')).toBeInTheDocument();
    expect(screen.getByText('로그인하기')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show protected content when authenticated', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: '테스트유저',
      city: '서울',
      district: '강남구',
      currentSport: '축구',
      isAdmin: false
    };

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'token') return 'valid-token';
      return null;
    });

    const TestWrappedComponent = withAuth(() => <div>Protected Content</div>);

    render(
      <AuthProvider>
        <TestWrappedComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('로그인이 필요합니다')).not.toBeInTheDocument();
  });
});