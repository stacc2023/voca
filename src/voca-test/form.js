
import { useState, useEffect } from 'react';
import ButtonFrame from '../gui/button';
import './form.scss';

const CHECK_INDEX = 0;
const WORD_INDEX = 1;

export default function Form(props) {

    const {config, setConfig, setSheet } = props;

    const [start, setStart] = useState(config.start);
    const [end, setEnd] = useState(config.end);

    return (<div className='form'>
        <table>
            <tbody>
                <tr>
                    <td><label htmlFor="start">처음:</label></td>
                    <td><input id="start" type="number" value={start} onChange={e => setStart(e.target.value)} /></td>
                </tr>
                <tr>
                    <td><label htmlFor="end">끝:</label></td>
                    <td><input id="end" type="number" value={end} onChange={e => setEnd(e.target.value)} /></td>
                </tr>
                <tr>
                    <td><label htmlFor="repeat">반복단위:</label></td>
                    <td><input id="repeat" type="number" value={config.repeat} onChange={e => setConfig({...config, repeat: e.target.value })} /></td>
                </tr>
                <tr>
                    <td><label htmlFor="word-limit">입력 제한시간:</label></td>
                    <td><input id="word-limit" type="number" value={config.limit} onChange={e => setConfig({...config, limit: e.target.value })}/></td>
                </tr>
                <tr>
                    <td><label htmlFor="mean-limit">뜻 보여주는 시간:</label></td>
                    <td><input id="mean-limit" type="number" value={config.meanLimit} onChange={e => setConfig({...config, meanLimit: e.target.value })}/></td>
                </tr>
                <tr>
                    <td><label htmlFor="erase">외운 단어 제외:</label></td>
                    <td><input id="erase" type="checkbox" checked={config.erase} onChange={e => setConfig({...config, erase: e.target.checked })}/></td>
                </tr>
                <tr>
                    <td><label htmlFor="sort">랜덤정렬:</label></td>
                    <td><input id="sort" type="checkbox" checked={config.sort} onChange={(e) => setConfig({...config, sort: e.target.checked })}/></td>
                </tr>
            </tbody>
        </table>
        <ButtonFrame className="right bottom">
            <button onClick={e => {
                e.target.disabled = true;
                fetch('/words', {
                    method: 'POST',
                    body: JSON.stringify({ start, end, sheet: config.sheet }),
                }).then(res => res.json()).then(data => {
                    /**
                     * 단어 파이프라인 만들기
                     */
                    const words = config.erase ? data.filter(row => row[CHECK_INDEX] == 'FALSE') : [...data];
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
    </div>)
}