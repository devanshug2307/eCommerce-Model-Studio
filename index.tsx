
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UpgradePage from './pages/Upgrade';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

function Router() {
  const [path, setPath] = React.useState(window.location.pathname);
  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const Page = path === '/upgrade' ? <UpgradePage /> : <App />;
  return (
    <AuthProvider>
      <AuthGuard>
        {Page}
      </AuthGuard>
    </AuthProvider>
  );
}

root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
