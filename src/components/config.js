import { useState, useContext } from 'react';
import ButtonFrame from '../gui/button';
import Form from '../gui/form';
import { CHAPTER_COLUMN, CHECK_COLUMN, MEAN_COLUMN, STATE_IDLE, STATE_PLAY_CARD, STATE_PLAY_SHEET, WORD_COLUMN } from '../context/types';
import { ConfigContext } from '../context';

export default function Config() {
    const { config, dispatch } = useContext(ConfigContext);
    const [ start, setStart ] = useState(config.start);
    const [ end, setEnd ] = useState(config.end);

    const startTest = mode => e => {
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
                        acc[0] = [[cur[CHECK_COLUMN]], [cur[WORD_COLUMN]], cur[MEAN_COLUMN].split(';')[0], [cur[CHAPTER_COLUMN]]];
                    } else if (acc[acc.length - 1][MEAN_COLUMN] == cur[MEAN_COLUMN].split(';')[0]) { // 뜻이 같으면 합치기
                        acc[acc.length - 1][CHECK_COLUMN].push(cur[CHECK_COLUMN]);
                        acc[acc.length - 1][WORD_COLUMN].push(cur[WORD_COLUMN]);
                        acc[acc.length - 1][CHAPTER_COLUMN].push(cur[CHAPTER_COLUMN]);
                    } else { // 뜻이 다르면 나누기
                        acc.push([[cur[CHECK_COLUMN]], [cur[WORD_COLUMN]], cur[MEAN_COLUMN].split(';')[0], [cur[CHAPTER_COLUMN]]]);
                    }
                    return acc;
                }, []).map(row => {
                    row[CHECK_COLUMN] = row[CHECK_COLUMN].join(', ');
                    row[WORD_COLUMN] = row[WORD_COLUMN].join(', ');
                    row[CHAPTER_COLUMN] = row[CHAPTER_COLUMN].join('| ');
                    return row;
                });
            }
            
            if (config.sort) {
                let currentIndex = words.length, randomIndex;
                while (currentIndex != 0) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex--;
                    [words[currentIndex], words[randomIndex]] = [words[randomIndex], words[currentIndex]];
                }
            }
            // start와 end를 config에 직접 연동해 버리면, 시작 버튼은 문제 없으나 불러오기 버튼에서 문제 생김 
            if (mode == 'card') {
                dispatch({
                    type: 'update',
                    value: {
                        start,
                        end,
                        words,
                        data,
                        state: STATE_PLAY_CARD,
                        index: 0,
                        cursor: WORD_COLUMN,
                        stop: false,
                    }
                })
            } else if (mode == 'sheet') {
                dispatch({
                    type: 'update',
                    value: {
                        words, data, state: STATE_PLAY_SHEET,
                    }
                })
            }
        });
    }


    return (
        <div>
            <Form>
                <input id="start" type="number" name="시작" value={start} onChange={e => setStart(e.target.value)} />
                <input id="end" type="number" name="끝" value={end} placeholder="MAX" onChange={e => setEnd(e.target.value)} />
                <input id="repeat" type="number" name="반복 단위" placeholder="반복없음" value={config.repeat} onChange={e => dispatch({type: 'update', value: { repeat: e.target.value }})} />
                <input id="word-limit" type="number" name="단어 제한시간" disabled={config.speachLimit} value={config.speachLimit ? '' : config.limit} onChange={e => dispatch({type: 'update', value: { limit: e.target.value }})} />
                <input id="mean-limit" type="number" name="뜻 제한시간" value={config.meanLimit} onChange={e => dispatch({type: 'update', value: { meanLimit: e.target.value }})} />
                <input id="erase" type="checkbox" name="외운 단어 제외" checked={config.erase} onChange={e => dispatch({type: 'update', value: { erase: e.target.checked }})} />
                <input id="sort" type="checkbox" name="무작위" checked={config.sort} onChange={e => dispatch({type: 'update', value: { sort: e.target.checked }})} />
                <input id="merge" type="checkbox" name="동의어 합치기" checked={config.merge} onChange={e => dispatch({type: 'update', value: { merge: e.target.checked, touchSheet: e.target.checked ? false : config.touchSheet }})} />
                <input id="speach-limit" type="checkbox" name="음성 기반 제한시간" checked={config.speachLimit} onChange={e => dispatch({type: 'update', value: { speachLimit: e.target.checked }})} />
                <input id="touch" type="checkbox" name="(시트)터치하여 체크" disabled={config.merge} checked={config.touchSheet} onChange={e => dispatch({type: 'update', value: { touchSheet: e.target.checked }})} />
                <input id="latex" type="checkbox" name="수식" checked={config.latex} onChange={e => dispatch({type: 'update', value: { latex: e.target.checked }})} />
            </Form>
            <ButtonFrame className="right bottom">
                <button onClick={startTest('sheet')}>시트</button>
                <button onClick={startTest('card')}>카드</button>
                <button onClick={e => {
                    /**
                     * start end 값에 따라 오류 발생
                     */
                    if (!confirm('초기화 하시겠습니까?')) return;
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
                            state: STATE_PLAY_CARD,
                            stop: false,
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