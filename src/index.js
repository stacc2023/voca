import ReactDOM from 'react-dom/client';
import './index.scss';
import Sheets from './components/sheets';
import { Provider } from './context';

function App() {

    return <Provider><Sheets /></Provider>

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);