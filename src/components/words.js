import { useEffect, useContext } from 'react';
import { CHECK_COLUMN, INIT_LIMIT, INIT_MEANLIMIT, MEAN_COLUMN, STATE_SET_SHEET, WORD_COLUMN } from '../context/types';
import './test.scss';
import { ConfigContext } from '../context';
import Bar from '../gui/bar';
import WordBar from '../gui/word-bar';
import ButtonFrame from '../gui/button';

export default function Words(props) {
    const { config, dispatch } = useContext(ConfigContext);

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
        if (!config.speach && config.cursor == MEAN_COLUMN) return;
        await window.audioContext.resume();
        
        // 오디오 기준의 시간제한
        if (config.speachLimit) {
            dispatch({
                type: 'update',
                value: {
                    limit: 1000000,
                    meanLimit: config.speach ? 1000000: config.meanLimit,
                    stop: true,
                }
            });
        }

        // 언어 타입
        let code;
        if (config.cursor == MEAN_COLUMN) {
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
        if (config.speachLimit) { 
            dispatch({
                type: 'update',
                value: {
                    limit: audio.duration * 1000,
                    meanLimit: config.speach ? audio.duration * 1000 : config.meanLimit,
                    stop: false,
                }
            })
            // setConfig(config => { return { ...config, limit: audio.duration * 1000, meanLimit: audio.duration * 1000, stop: false } })
        }
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

    const check = answer => e => {
        dispatch({
            type: 'check',
            answer,
        })
        // setConfig(config => {return { ...config, cursor: MEAN_COLUMN, stop:false }});
    }
    const backward = (e) => {
        dispatch({ type: 'prev' });
    }
    const forward = e => {
        dispatch({ type: 'next', force: true });
    }


    /**
     * ****************************** ui ******************************
     */


    return (<div className="test">
        <Bar 
            key={'' + config.index + config.cursor + 'dur' + config.limit} 
            max={config.cursor == MEAN_COLUMN ? config.meanLimit : config.limit} // 단어는 limit만큼, 뜻은 1초만큼 보여주고 다음 페이지로 넘어감
            stop={config.stop}
            callback={() => {
                // 뜻 페이지인 경우, 마지막 단어 또는 반복 단어가 아니라면 다음 단어로
                if (config.cursor == MEAN_COLUMN) {
                    dispatch({ type: 'next' })
                // 영어 페이지인 경우, check(false)
                } else {
                    check(false)();
                }
            }} />
        <WordBar key={'' + config.index + config.cursor + 'bar'} />
        <div className='arrow'>
            <button onClick={backward}>{'<'}</button>
            <button onClick={forward}>{'>'}</button>
        </div>
        <div className="content">      
            <div className='word' style={{color: config.words[config.index][CHECK_COLUMN] == 'TRUE' ? 'green' : 'red'}}>
                {config.words[config.index][config.cursor]}
            </div>
        </div>
        <ButtonFrame className="bottom center">
            <button onClick={check(true)} style={{color: 'rgb(0,255,0)'}}>정답</button>
            <button onClick={check(false)} style={{color: 'rgb(255, 50, 50)'}}>오답</button>
        </ButtonFrame>
        <ButtonFrame className="top left">        
            <button onClick={e => {
                    dispatch({
                        type: 'update',
                        value: {
                            uk: !config.uk,
                        }
                    });
                }} style={{
                    paddingLeft: '5px',
                    paddingRight: '5px',
            }}>{config.uk ? '영국' : '미국'}</button>
        </ButtonFrame>
        <ButtonFrame className="top right">
            <button onClick={e => {
                dispatch({
                    type: 'update',
                    value: {
                        stop: !config.stop,
                    }
                });
            }}>{config.stop ? '시작' : '정지'}</button>
            <button disabled={config.merge} onClick={e => {
                e.target.disabled=true;
                dispatch({
                    type: 'update',
                    value: {
                        stop: true,
                    }
                });
                fetch('/erase', {
                    method: 'POST',
                    body: JSON.stringify(config),
                }).then(res => res.json()).then(result => {
                    dispatch({
                        type: 'update',
                        value: {
                            stop: true,
                        }
                    });
                    e.target.disabled=false;
                });
            }}>저장</button>
            <button onClick={e => {
                dispatch({
                    type: 'update',
                    value: {
                        state: STATE_SET_SHEET,
                        limit: config.speachLimit ? INIT_LIMIT : config.limit,
                        meanLimit: config.speachLimit ? INIT_MEANLIMIT : config.meanLimit,
                    }
                });
            }}>종료</button>
        </ButtonFrame>
    </div>)

}