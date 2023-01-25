import ReactDOM from 'react-dom/client';
import { useState, useEffect,useRef } from 'react';
import Test from './voca-test';
import './index.scss';

function App() {
    const audioRef = useRef(null);
    const [sheets, setSheets] = useState([]);
    const [sheet, setSheet] = useState(null);

    useEffect(() => {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        window.audioContext.resume();

        fetch('/sheets').then(res => res.json()).then(data => {
            setSheets(data);       
        })
    }, [])

    if (!sheet) {
        return (<div className='container'>   
            <audio key="audio" src="/static/test.mp3" ref={audioRef} />
            {/* <button onClick={e => audioRef.current.play()}>소리 오류 해결</button> */}
            <div className='title'>단어장 목록</div>
            <ul className="sheet-list">
                {sheets.map(sheet => <li 
                    key={sheet.id}
                    onClick={e => { audioRef.current.play(); setSheet(sheet.title); }}>
                        {sheet.title}
                </li>)}
            </ul>
        </div>)
    } else {
        return <><audio key="audio" src="/static/test.mp3" ref={audioRef} /><Test sheet={sheet} setSheet={setSheet} /></>
    } 

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);