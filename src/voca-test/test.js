import { useState } from 'react';
import Bar from './bar';
import './test.scss';

const CHECK_INDEX = 0;
const WORD_INDEX = 1;
const MEAN_INDEX = 2;


export default function Test(props) {
    const {config, setConfig} = props;
    const [stop, setStop] = useState(false);

    // yes | no 버튼 누르면, config.words(config.data와 연동)의 데이터 변경 후 뜻 보여주기
    // config.stop = false
    const check = ans => e => {
        config.words[config.index][CHECK_INDEX] = ans;
        setConfig({ ...config, cursor: MEAN_INDEX, stop:false });
    }
    // 뒤로가기 버튼 누르면, 현재 커서가 뜻인 경우 해당 단어를 보여주고 단어인 경우 이전 단어
    // config.stop = false
    const backward = (e) => {
        if (config.cursor == MEAN_INDEX) {
            setConfig({ ...config, cursor: WORD_INDEX, stop: false });
        } else if (config.index > 0) {
            setConfig({ ...config, index: config.index - 1, stop: false })
        }
    }
    // 앞으로 가기 버튼 누르면 커서에 상관 없이 다음 단어
    // config.stop = false
    const forward = e => {
        if (config.index < config.words.length - 1) {
            setConfig({ ...config, index: config.index + 1, cursor: WORD_INDEX, stop:false });
        }
    }
    // config.repeat가 0이 아닌 경우 이전 단어 묶음을 모두 맞췄는지에 따라 반복 여부 결정
    const passable = () => {
        for (let i = config.index - config.repeat + 1; i <= config.index; i++) {
            if (config.words[i][CHECK_INDEX] == 'FALSE') return false
        }
        return true
    }

    // 맞은 개수와 틀린 개수 표기하기 위한 계산
    let yes = 0;
    let no = 0;
    for (let row of config.words) {
        if (row[CHECK_INDEX] == 'TRUE') yes++;
        else no++;
    }

    return (<div className="test">
        <Bar 
            key={'' + config.index + config.cursor + 'num'} 
            val={config.index + 1} 
            max={config.words.length} />
        <Bar 
            key={'' + config.index + config.cursor + 'dur'} 
            max={config.cursor == MEAN_INDEX ? config.meanLimit : config.limit} // 단어는 limit만큼, 뜻은 1초만큼 보여주고 다음 페이지로 넘어감
            stop={config.stop}
            callback={() => {
                // 뜻 페이지인 경우, 마지막 단어 또는 반복 단어가 아니라면 다음 단어로
                if (config.cursor == MEAN_INDEX) {
                    if (config.repeat != 0 && config.index % config.repeat == config.repeat - 1 && !passable()) {
                        setConfig({ ...config, index: config.index - config.repeat + 1, cursor: WORD_INDEX });
                    }
                    else if (config.index < config.words.length - 1) {
                        setConfig({ ...config, index: config.index + 1, cursor: WORD_INDEX });
                    }
                // 영어 페이지인 경우, check(false)
                } else {
                    check('FALSE')();
                }
            }} />
        <div>
            <span>{config.words.length}</span>
            /
            <span>{config.index+1}</span>
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
            <div className='word' style={{color: config.words[config.index][CHECK_INDEX] == 'TRUE' ? 'green' : 'red'}}>
                {config.words[config.index][config.cursor]}
            </div>
            {config.cursor == WORD_INDEX ?(<>
                <div className='check'>
                    <button onClick={check('TRUE')}>yes</button>
                    <button onClick={check('FALSE')}>no</button>
                </div>
            </>): null}
            <div className='control'>
                <button className='stop' onClick={e => {
                    setConfig({ ...config, stop: !config.stop });
                }}>{config.stop ? '시작' : '정지'}</button>
                <button className='save' onClick={e => {
                    e.target.disabled=true;
                    setConfig({ ...config, stop: true });
                    fetch('/erase', {
                        method: 'POST',
                        body: JSON.stringify(config),
                    }).then(res => res.json()).then(result => {
                        setConfig({ ...config, stop: false });
                        e.target.disabled=false;
                    });
                }}>저장</button>
                <button className='exit' onClick={e => {
                    setConfig({...config, status:0});
                }}>종료</button>
            </div>
        </div>
    </div>)

}