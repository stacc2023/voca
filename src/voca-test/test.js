import { useState } from 'react';
import Bar from './bar';
import './test.scss';

const CHECK_INDEX = 0;
const WORD_INDEX = 1;
const MEAN_INDEX = 2;


export default function Test(props) {
    const {config, index, setConfig, setIndex} = props;
    const [stop, setStop] = useState(0);

    const check = ans => e => {
        config.words[index[0]][CHECK_INDEX] = ans;
        setIndex([index[0], MEAN_INDEX]);
    }
    const backward = (e) => {
        if (index[1] == MEAN_INDEX) {
            setIndex([index[0], WORD_INDEX]);
        } else if (index[0] > 0) {
            setIndex([index[0] - 1, WORD_INDEX]);
        }
    }
    const forward = e => {
        if (index[0] < config.words.length - 1) {
            setIndex([index[0] + 1, WORD_INDEX]);
        }
    }
    const passable = () => {
        for (let i = index[0] - config.repeat + 1; i <= index[0]; i++) {
            if (config.words[i][CHECK_INDEX] == 'FALSE') return false
        }
        return true
    }
    const save = () => {

    }

    let yes = 0;
    let no = 0;
    for (let row of config.words) {
        if (row[CHECK_INDEX] == 'TRUE') yes++;
        else no++;
    }


    return (<div className="test">
        <Bar 
            key={'' + index[0] + index[1] + 'num'} 
            val={index[0] + 1} 
            max={config.words.length} />
        <Bar 
            key={'' + index[0] + index[1] + 'dur'} 
            max={index[1] == MEAN_INDEX ? 1000 : config.limit} // 단어는 limit만큼, 뜻은 1초만큼 보여주고 다음 페이지로 넘어감
            stop={stop}
            callback={() => {
                // 뜻 페이지인 경우, 마지막 단어 또는 반복 단어가 아니라면 다음 단어로
                if (index[1] == MEAN_INDEX) {
                    if (config.repeat != 0 && index[0] % config.repeat == config.repeat - 1 && !passable()) setIndex([index[0] - config.repeat + 1, WORD_INDEX]);
                    else if (index[0] < config.words.length - 1) setIndex([index[0] + 1, WORD_INDEX]);
                // 영어 페이지인 경우, check(false)
                } else {
                    check('FALSE')();
                }
            }} />
        <div>
            <span>{index[0]+1}</span>
            /
            <span style={{color: 'green'}}>{yes}</span>
            /
            <span style={{color: 'red'}}>{no}</span>
        </div>
        <div className="content">      
            <div className='arrow'>
                <button onClick={backward}>{'<'}</button>
                <button onClick={forward}>{'>'}</button>
            </div>
            <div className='word' style={{color: config.words[index[0]][CHECK_INDEX] == 'TRUE' ? 'green' : 'red'}}>
                {config.words[index[0]][index[1]]}
            </div>
            {index[1] == WORD_INDEX ?(<>
                <div className='check'>
                    <button onClick={check('TRUE')}>yes</button>
                    <button onClick={check('FALSE')}>no</button>
                </div>
            </>): null}
            <div className='control'>
                <button className='stop' onClick={e => {
                    setStop(!stop);
                }}>{stop ? '시작' : '정지'}</button>
                <button className='exit' onClick={() => {
                    if (!config.erase) {
                        setConfig(null);
                    } else {
                        fetch('/erase', {
                            method: 'POST',
                            body: JSON.stringify(config),
                        }).then(res => res.json()).then(result => {
                            console.log(result);
                            setConfig(null);
                        });
                    }
                }}>
                    {config.erase ? '저장 및 종료' : '종료'}
                </button>
            </div>
        </div>
    </div>)

}