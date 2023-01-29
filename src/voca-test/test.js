import { useState, useEffect } from 'react';
import Bar from '../gui/bar';
import ButtonFrame from '../gui/button';
import WordBar from '../gui/word-bar';
import './test.scss';

const CHECK_INDEX = 0;
const WORD_INDEX = 1;
const MEAN_INDEX = 2;

export default function Test(props) {
    const {config, setConfig} = props;





    /**
     * ****************************** TTS ******************************
     */
    
    // 정지된 경우 api 정지, 다시 시작된 경우 재할당
    useEffect(() => {
        if (config.stop && window.audioContext) {
            window.audioContext.suspend();
        } else if (window.audioContext.state == 'suspended' || window.audioContext.state == 'closed') {
            document.querySelector('#test').play();
            document.querySelector('#test').pause();
            if (!config.speachLimit) window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            window.audioContext.resume();
        } else {
        }
    }, [config.stop])

    // 인덱스나 커서가 변경 된 경우 불러오기
    async function tts() {
        if (!config.speach && config.cursor == MEAN_INDEX) return;
        await window.audioContext.resume();
        
        if (config.speachLimit) setConfig(config => { return { ...config, limit: 100000, meanLimit: 100000, stop: true } })

        // 언어 타입
        let code;
        if (config.cursor == MEAN_INDEX) {
            code = 'ko-KR';
        } else if (config.uk) {
            code = 'en-GB';
        } else {
            code = 'en-US';
        }
    
        const res = await fetch('/speach', {
            method: 'POST',
            body: JSON.stringify({ word: config.words[config.index][config.cursor], code }),
        });
        const data = await res.arrayBuffer(); 
        const audio = await window.audioContext.decodeAudioData(data);
        if (config.speachLimit) setConfig(config => { return { ...config, limit: audio.duration * 1000, meanLimit: audio.duration * 1000, stop: false } })
        if (window.playSound) window.playSound.stop();
        window.playSound = window.audioContext.createBufferSource();
        window.playSound.buffer = audio;
        window.playSound.connect(window.audioContext.destination);
        window.playSound.start(window.audioContext.currentTime);
    }
    useEffect(() => {
        tts();
    }, [config.index, config.cursor]);





    /**
     * ****************************** ui 함수 ******************************
     */


    // yes | no 버튼 누르면, config.words(config.data와 연동)의 데이터 변경 후 뜻 보여주기
    // config.stop = false
    const check = ans => e => {
        config.words[config.index][CHECK_INDEX] = ans;
        setConfig(config => {return { ...config, cursor: MEAN_INDEX, stop:false }});
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
        return true;
    }





    /**
     * ****************************** ui ******************************
     */


    return (<div className="test">
        <Bar 
            key={'' + config.index + config.cursor + 'dur' + config.limit} 
            max={config.cursor == MEAN_INDEX ? config.meanLimit : config.limit} // 단어는 limit만큼, 뜻은 1초만큼 보여주고 다음 페이지로 넘어감
            stop={config.stop}
            callback={() => {
                // 뜻 페이지인 경우, 마지막 단어 또는 반복 단어가 아니라면 다음 단어로
                if (config.cursor == MEAN_INDEX) {
                    if (config.repeat != 0 && (config.index % config.repeat == config.repeat - 1 || config.index == config.words.length - 1) && !passable()) {
                        setConfig(config => { return { ...config, index: config.index - config.repeat + 1, cursor: WORD_INDEX } });
                    }
                    else if (config.index < config.words.length - 1) {
                        setConfig(config => { return { ...config, index: config.index + 1, cursor: WORD_INDEX } });
                    }
                // 영어 페이지인 경우, check(false)
                } else {
                    check('FALSE')();
                }
            }} />
        <WordBar key={'' + config.index + config.cursor + 'bar'} config={config} setConfig={setConfig} />
        <div className='arrow'>
            <button onClick={backward}>{'<'}</button>
            <button onClick={forward}>{'>'}</button>
        </div>
        <div className="content">      
            <div className='word' style={{color: config.words[config.index][CHECK_INDEX] == 'TRUE' ? 'green' : 'red'}}>
                {config.words[config.index][config.cursor]}
            </div>
        </div>
        <ButtonFrame className="bottom center">
            <button onClick={check('TRUE')} disabled={config.cursor != WORD_INDEX} style={{color: config.cursor != WORD_INDEX ? '#aaa' : 'rgb(0,255,0)'}}>정답</button>
            <button onClick={check('FALSE')} disabled={config.cursor != WORD_INDEX} style={{color: config.cursor != WORD_INDEX ? '#aaa' : 'rgb(255, 50, 50)'}}>오답</button>
        </ButtonFrame>
        <ButtonFrame className="top left">        
            <button onClick={e => {
                    setConfig({ ...config, uk: !config.uk });
                }} style={{
                    paddingLeft: '5px',
                    paddingRight: '5px',
            }}>{config.uk ? '영국' : '미국'}</button>
        </ButtonFrame>
        <ButtonFrame className="top right">
            <button onClick={e => {
                setConfig({ ...config, stop: !config.stop });
            }}>{config.stop ? '시작' : '정지'}</button>
            <button disabled={config.merge} onClick={e => {
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
            <button onClick={e => {
                setConfig({...config, status:0});
            }}>종료</button>
        </ButtonFrame>
    </div>)

}