import './App.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import Landing from './pages/Landing';
import SeatSelector from './pages/SeatSelector';
import Payment from './components/Payment';
import AdminPanel from './pages/AdminPanel';
import Ok from './pages/Ok';
import NotOk from './pages/NotOk';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' exact Component={Landing} />
        <Route path='/Seat-selection' exact Component={SeatSelector} />
        <Route path='/payment' exact Component={Payment} />
        <Route path='/admin' exact Component={AdminPanel} />
        <Route path='/ok' exact Component={Ok} />
        <Route path='/not-ok' exact Component={NotOk} />
      </Routes>
    </Router>
    </>
    
  );
}

export default App;
