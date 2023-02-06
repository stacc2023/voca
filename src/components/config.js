import { useState, useContext } from 'react';
import ButtonFrame from '../gui/button';
import Form from '../gui/form';
import { CHECK_COLUMN, STATE_IDLE, STATE_SET_WORD, WORD_COLUMN } from '../context/types';
import { ConfigContext } from '../context';

export default function Config() {
    const { config, dispatch } = useContext(ConfigContext);
    const [ start, setStart ] = useState(config.start);
    const [ end, setEnd ] = useState(config.end);

    return (
        <div>
            <Form>
                <input id="start" type="number" name="시작" value={start} onChange={e => setStart(e.target.value)} />
                <input id="end" type="number" name="끝" value={end} onChange={e => setEnd(e.target.value)} />
                <input id="repeat" type="number" name="반복 단위" value={config.repeat} onChange={e => dispatch({type: 'update', value: { repeat: e.target.value }})} />
                <input id="word-limit" type="number" name="단어 제한시간" disabled={config.speachLimit} value={config.speachLimit ? '' : config.limit} onChange={e => dispatch({type: 'update', value: { limit: e.target.value }})} />
                <input id="mean-limit" type="number" name="뜻 제한시간" disabled={config.speachLimit && config.speach} value={config.speachLimit && config.speach ? '' : config.meanLimit} onChange={e => dispatch({type: 'update', value: { meanLimit: e.target.value }})} />
                <input id="erase" type="checkbox" name="외운 단어 제외" checked={config.erase} onChange={e => dispatch({type: 'update', value: { erase: e.target.checked }})} />
                <input id="sort" type="checkbox" name="무작위" checked={config.sort} onChange={e => dispatch({type: 'update', value: { sort: e.target.checked }})} />
                <input id="mean-speach" type="checkbox" name="뜻 음성" checked={config.speach} onChange={e => dispatch({type: 'update', value: { speach: e.target.checked }})} />
                <input id="merge" type="checkbox" name="동의어 합치기" checked={config.merge} onChange={e => dispatch({type: 'update', value: { merge: e.target.checked }})} />
                <input id="speach-limit" type="checkbox" name="음성 기반 제한시간" checked={config.speachLimit} onChange={e => dispatch({type: 'update', value: { speachLimit: e.target.checked }})} />
            </Form>
            <ButtonFrame className="right bottom">
                <button onClick={e => {
                    e.target.disabled = true;
                    document.querySelector('#test').play();
                    document.querySelector('#test').pause();                    
                    fetch('/words', {
                        method: 'POST',
                        body: JSON.stringify({ start, end, sheet: config.sheet }),
                    }).then(res => res.json()).then(async data => {
                        /**
                         * 단어 파이프라인 만들기
                         */
                        await window.audioContext.resume();
                        let words = config.erase ? data.filter(row => row[CHECK_COLUMN] == 'FALSE') : [...data];
                        if (!words.length) { // 단어가 없으면 종료
                            alert('조건에 맞는 단어가 없습니다');
                            e.target.disabled = false;
                            return;
                        }
                        if (config.merge) {
                            words = words.reduce((acc, cur) => {
                                if (!acc.length) { // 첫번째
                                    acc[0] = ['FALSE', [cur[1]], cur[2]];
                                } else if (acc[acc.length - 1][2] == cur[2]) { // 뜻이 같으면 합치기
                                    acc[acc.length - 1][1].push(cur[1]);
                                } else { // 뜻이 다르면 나누기
                                    acc.push(['FALSE', [cur[1]], cur[2]]);
                                }
                                return acc;
                            }, []).map(row => {
                                row[1] = row[1].join(', ');
                                return row;
                            });
                        }
                        
                        if (config.sort) {
                            words.sort(() => Math.random() - 0.5);
                        }
                        // start와 end를 config에 직접 연동해 버리면, 시작 버튼은 문제 없으나 불러오기 버튼에서 문제 생김 
                        dispatch({
                            type: 'update',
                            value: {
                                start,
                                end,
                                words,
                                data,
                                state: STATE_SET_WORD,
                                index: 0,
                                cursor: WORD_COLUMN,
                                stop: false,
                            }
                        })
                    });
                }}>시작</button>
                <button onClick={e => {
                    /**
                     * start end 값에 따라 오류 발생
                     */
                    e.target.disabled = true;
                    fetch('/reset', {
                        method: 'POST',
                        body: JSON.stringify({ start, end, sheet:config.sheet }),
                    }).then(res => res.json()).then(data => e.target.disabled = false);
                }}>초기화</button>
                <button disabled={!config.words ? true : false} onClick={e => {
                    document.querySelector('#test').play();
                    document.querySelector('#test').pause();
                    dispatch({
                        type: 'update',
                        value: {
                            state: STATE_SET_WORD,
                        }
                    })
                }}>불러오기</button>
            </ButtonFrame>
            <ButtonFrame className="top right">
                <button onClick={e => dispatch({ type: 'reset' })}>종료</button>
            </ButtonFrame>
        </div>
    )
}