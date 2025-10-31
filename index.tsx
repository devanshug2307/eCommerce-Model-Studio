
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UpgradePage from './pages/Upgrade';
import HomePage from './pages/Home';
import GalleryPage from './pages/Gallery';
import ShowcasePage from './pages/Showcase';
import AdminShowcasePage from './pages/AdminShowcase';
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

  let Page: React.ReactNode;
  if (path === '/studio') {
    Page = (
      <AuthGuard>
        <App />
      </AuthGuard>
    );
  } else if (path === '/gallery') {
    Page = (
      <AuthGuard>
        <GalleryPage />
      </AuthGuard>
    );
  } else if (path === '/upgrade') {
    Page = <UpgradePage />;
  } else if (path === '/showcase') {
    Page = <ShowcasePage />;
  } else if (path === '/admin/showcase') {
    Page = (
      <AuthGuard>
        <AdminShowcasePage />
      </AuthGuard>
    );
  } else {
    Page = <HomePage />;
  }

  return <AuthProvider>{Page}</AuthProvider>;
}

root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
