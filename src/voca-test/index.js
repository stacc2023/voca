import './index.scss';
import Form from './form';
import Test from './test';
import { useState, useEffect } from 'react';

const WORD_INDEX = 1;

export default function Window(props) {
    const [config, setConfig] = useState({
        sheet: props.sheet,
        start: 1,
        end: '',
        repeat: 0,
        limit: 3000,
        meanLimit: 1000,
        erase: false,
        sort: false,
        status: 0,
        index: 0,
        cursor: WORD_INDEX,
        stop: false,
    });
    // [번호, 체크, 암기, 영어, 한글]

    // config가 null 인 경우 설정 창
    if (!config.status) {
        return <div className='background'>
            <div className='window'>
                <Form 
                    setSheet={props.setSheet}
                    config={config}
                    setConfig={setConfig} />
            </div>
        </div>
    // 테스트 창
    } else {
        return <div className="background">
            <div className="window">
                <Test config={config} setConfig={setConfig} />
            </div>
        </div>
    }
}