import './index.scss';
import Form from './form';
import Test from './test';
import { useState, useEffect } from 'react';

const WORD_INDEX = 1;

export default function Window(props) {
    const [config, setConfig] = useState(null);
    // [번호, 체크, 암기, 영어, 한글]
    const [index, setIndex] = useState([0, WORD_INDEX]);

    // form 변수들 끌어올리기
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [repeat, setRepeat] = useState(0);
    const [limit, setLimit] = useState(3000);
    const [erase, setErase] = useState(false);
    const [sort, setSort] = useState(false);

    // config가 null 인 경우 설정 창
    if (!config) {
        if (index[0] != 0) setIndex([0, 2]);

        return <div className='background'>
            <div className='window'>
                <Form 
                    sheet={props.sheet}
                    setSheet={props.setSheet}
                    setConfig={setConfig} 
                    start={start} 
                    setStart={setStart}
                    end={end}
                    setEnd={setEnd}
                    repeat={repeat}
                    setRepeat={setRepeat}
                    limit={limit}
                    setLimit={setLimit}
                    erase={erase}
                    setErase={setErase}
                    sort={sort}
                    setSort={setSort} />
            </div>
        </div>
    // 테스트 창
    } else {
        return <div className="background">
            <div className="window">
                <Test config={config} index={index} setIndex={setIndex} setConfig={setConfig} />
            </div>
        </div>
    }
}