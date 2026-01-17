import { Route, Switch, Link, useLocation } from 'wouter';
import { CoreDemo } from './demos/CoreDemo';
import { NodesDemo } from './demos/NodesDemo';
import { TransportDemo } from './demos/TransportDemo';
import { SequencerDemo } from './demos/SequencerDemo';
import { VisualizerDemo } from './demos/VisualizerDemo';
import './App.css';

const demos = [
  { path: '/', label: 'Home', component: Home },
  { path: '/core', label: 'Core', component: CoreDemo },
  { path: '/nodes', label: 'Nodes', component: NodesDemo },
  { path: '/transport', label: 'Transport', component: TransportDemo },
  { path: '/sequencer', label: 'Sequencer', component: SequencerDemo },
  // Future demos:
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
        <Link href="/nodes" className="demo-link">
          <h3>Nodes</h3>
          <p>Gain, Delay, StereoPanner, Compressor</p>
        </Link>
        <Link href="/transport" className="demo-link">
          <h3>Transport</h3>
          <p>BPM, time signatures, playback control</p>
        </Link>
        <Link href="/sequencer" className="demo-link">
          <h3>Sequencer</h3>
          <p>TR-909 drums & TB-303 acid synth</p>
        </Link>
        <Link href="/visualizer" className="demo-link">
          <h3>Visualizer</h3>
          <p>R3F, TSL, Audio Reactive Ink</p>
        </Link>
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
          <Route path="/nodes" component={NodesDemo} />
          <Route path="/transport" component={TransportDemo} />
          <Route path="/sequencer" component={SequencerDemo} />
          <Route path="/visualizer" component={VisualizerDemo} />
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
