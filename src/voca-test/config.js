
import { useState, useEffect } from 'react';
import ButtonFrame from '../gui/button';
import Form from '../gui/form';

const CHECK_INDEX = 0;
const WORD_INDEX = 1;

export default function Config(props) {

    const {config, setConfig, setSheet } = props;

    const [start, setStart] = useState(config.start);
    const [end, setEnd] = useState(config.end);

    return (
        <div>
            <Form>
                <input id="start" type="number" name="시작" value={start} onChange={e => setStart(e.target.value)} />
                <input id="end" type="number" name="끝" value={end} onChange={e => setEnd(e.target.value)} />
                <input id="repeat" type="number" name="반복 단위" value={config.repeat} onChange={e => setConfig({...config, repeat: e.target.value })} />
                <input id="word-limit" type="number" name="단어 제한시간" disabled={config.speachLimit} value={config.speachLimit ? '' : config.limit} onChange={e => setConfig({...config, limit: e.target.value })} />
                <input id="mean-limit" type="number" name="뜻 제한시간" disabled={config.speachLimit} value={config.speachLimit ? '' : config.meanLimit} onChange={e => setConfig({...config, meanLimit: e.target.value })} />
                <input id="erase" type="checkbox" name="외운 단어 제외" checked={config.erase} onChange={e => setConfig({...config, erase: e.target.checked })} />
                <input id="sort" type="checkbox" name="무작위" checked={config.sort} onChange={e => setConfig({...config, sort: e.target.checked })} />
                <input id="mean-speach" type="checkbox" name="뜻 음성" checked={config.speach} onChange={e => setConfig({...config, speach: e.target.checked })} />
                <input id="merge" type="checkbox" name="동의어 합치기" checked={config.merge} onChange={e => setConfig({...config, merge: e.target.checked })} />
                <input id="speach-limit" type="checkbox" name="음성 기반 제한시간" checked={config.speachLimit} onChange={e => setConfig({...config, speachLimit: e.target.checked })} />
            </Form>
            <ButtonFrame className="right bottom">
                <button onClick={e => {
                    e.target.disabled = true;
                    fetch('/words', {
                        method: 'POST',
                        body: JSON.stringify({ start, end, sheet: config.sheet }),
                    }).then(res => res.json()).then(async data => {
                        /**
                         * 단어 파이프라인 만들기
                         */
                        await window.audioContext.resume();
                        let words = config.erase ? data.filter(row => row[CHECK_INDEX] == 'FALSE') : [...data];
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
                        setConfig({...config, start, end, words, data, status: 1, index: 0, cursor: WORD_INDEX, stop: false });
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
                <button disabled={!config.words ? true : false} onClick={e => setConfig({ ...config, status: 1 })}>불러오기</button>
            </ButtonFrame>
            <ButtonFrame className="top right">
                <button onClick={e => setSheet(null)}>종료</button>
            </ButtonFrame>
        </div>
    )
}