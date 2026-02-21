import { Route, Routes, Link } from 'react-router-dom';

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-xl font-bold">Time Tracker</h1>
        </div>
      </header>

      <nav className="mx-auto max-w-7xl px-4 py-2">
        <ul className="flex gap-4">
          <li>
            <Link to="/" className="text-primary hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-primary hover:underline">
              About
            </Link>
          </li>
        </ul>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<p>Welcome to Time Tracker.</p>} />
          <Route path="/about" element={<p>About Time Tracker.</p>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
