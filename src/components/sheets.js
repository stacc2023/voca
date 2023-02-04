import { useContext, useEffect, useState } from "react";
import { ConfigContext } from "../context";
import { STATE_IDLE, STATE_SET_SHEET } from "../context/types";
import Window from "./window";

export default function Sheets() {
    const [ sheets, setSheets ] = useState([]);
    const { config, dispatch } = useContext(ConfigContext);

    useEffect(() => {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        fetch('/sheets').then(res => res.json()).then(data => {
            setSheets(data.filter(sheet => sheet.title.startsWith('voca-')));
        });
    }, []);

    if (config.state == STATE_IDLE) {
        return (<div className='container'>   
            <audio key="audio" id="test" src="/static/test.mp3" />
            <div className='title'>단어장 목록</div>
            <ul className="sheet-list">
                {sheets.map(sheet => <li 
                    key={sheet.id}
                    onClick={e => {     
                        document.querySelector('#test').play();
                        document.querySelector('#test').pause();
                        dispatch({
                            type: 'update', 
                            value: {
                                sheet: sheet.title,
                                state: STATE_SET_SHEET,
                            }
                        }); 
                    }}>
                        {sheet.title.split('-')[1]}
                </li>)}
            </ul>
        </div>)
    } else {
        return <><audio key="audio" id="test" src="/static/test.mp3" /><Window sheet={config.sheet} setSheet={config.setSheet} /></>
    } 
}