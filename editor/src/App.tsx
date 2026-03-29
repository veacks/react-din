import { EditorDemo } from './EditorDemo';
import { AgentBridgeClient } from './editor/agent-bridge/AgentBridgeClient';

function App() {
  return (
    <>
      <AgentBridgeClient />
      <EditorDemo />
    </>
  );
}

export default App;
