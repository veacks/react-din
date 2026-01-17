import { Route, Switch, Link, useLocation } from 'wouter';
import { CoreDemo } from './demos/CoreDemo';
import './App.css';

const demos = [
  { path: '/', label: 'Home', component: Home },
  { path: '/core', label: 'Core', component: CoreDemo },
  // Future demos:
  // { path: '/nodes', label: 'Nodes', component: NodesDemo },
  // { path: '/transport', label: 'Transport', component: TransportDemo },
  // { path: '/sequencer', label: 'Sequencer', component: SequencerDemo },
  // { path: '/analyzers', label: 'Analyzers', component: AnalyzersDemo },
];

function Home() {
  return (
    <div className="home">
      <h1>🎛️ react-din demos</h1>
      <p>Declarative WebAudio for React</p>
      <nav className="demo-list">
        <Link href="/core" className="demo-link">
          <h3>Core</h3>
          <p>AudioProvider, basic oscillator</p>
        </Link>
        <div className="demo-link disabled">
          <h3>Nodes</h3>
          <p>Coming soon...</p>
        </div>
        <div className="demo-link disabled">
          <h3>Transport</h3>
          <p>Coming soon...</p>
        </div>
        <div className="demo-link disabled">
          <h3>Sequencer</h3>
          <p>Coming soon...</p>
        </div>
        <div className="demo-link disabled">
          <h3>Analyzers</h3>
          <p>Coming soon...</p>
        </div>
      </nav>
    </div>
  );
}

function App() {
  const [location] = useLocation();

  return (
    <div className="app">
      {location !== '/' && (
        <header className="app-header">
          <Link href="/" className="back-link">← Back</Link>
          <span className="location">{location}</span>
        </header>
      )}
      <main className="app-main">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/core" component={CoreDemo} />
          <Route>
            <div className="not-found">
              <h2>404 - Not Found</h2>
              <Link href="/">Go Home</Link>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;
