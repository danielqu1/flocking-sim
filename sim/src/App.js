import './App.css';
import { Container } from '@material-ui/core';
import FlockingGui from './components/FlockingGui.tsx';

function App() {
  return (
    <Container maxWidth="lg" className="App">
      <header className="App-header">
        <h1>Flocking Simulator</h1>
        <FlockingGui/>
      </header>
    </Container>
  );
}

export default App;
