import ReactDOM from 'react-dom/client';
import { useState, useEffect } from 'react';
import Test from './voca-test';
import './index.scss';

function App() {
    const [sheets, setSheets] = useState([]);
    const [sheet, setSheet] = useState(null);

    useEffect(() => {
        fetch('/sheets').then(res => res.json()).then(data => {
            setSheets(data);       
        })
    }, [])

    if (!sheet) {
        return (<div className='container'>
            <div className='title'>단어장 목록</div>
            <ul className="sheet-list">
                {sheets.map(sheet => <li 
                    key={sheet.id}
                    onClick={e => setSheet(sheet.title)}>
                        {sheet.title}
                </li>)}
            </ul>
        </div>)
    } else {
        return <Test sheet={sheet} setSheet={setSheet} />
    } 

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);