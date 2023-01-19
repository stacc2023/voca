
import { useState, useEffect } from 'react';
import './form.scss';

const CHECK_INDEX = 0;

export default function Form(props) {

    const {sheet, start, setStart, end, setEnd, repeat, setRepeat, limit, setLimit, erase, setErase, sort, setSort} = props;

    return (<div className='form'>
        <table>
            <tr>
                <td><label htmlFor="start">처음:</label></td>
                <td><input id="start" type="number" value={start} onChange={(e) => setStart(e.target.value)} /></td>
            </tr>
            <tr>
                <td><label htmlFor="end">끝:</label></td>
                <td><input id="end" type="number" value={end} onChange={(e) => setEnd(e.target.value)} /></td>
            </tr>
            <tr>
                <td><label htmlFor="repeat">반복단위:</label></td>
                <td><input id="repeat" type="number" value={repeat} onChange={(e) => setRepeat(e.target.value)} /></td>
            </tr>
            <tr>
                <td><label htmlFor="time-limit">제한시간:</label></td>
                <td><input id="time-limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)}/></td>
            </tr>
            <tr>
                <td><label htmlFor="erase">지우기:</label></td>
                <td><input id="erase" type="checkbox" checked={erase} onChange={(e) => setErase(e.target.checked)}/></td>
            </tr>
            <tr>
                <td><label htmlFor="sort">랜덤정렬:</label></td>
                <td><input id="sort" type="checkbox" checked={sort} onChange={(e) => {console.log(e.target.checked); setSort(e.target.checked);}}/></td>
            </tr>
        </table>
        <div>
            <button onClick={() => {
                fetch('/words', {
                    method: 'POST',
                    body: JSON.stringify({ start, end, sheet }),
                }).then(res => res.json()).then(data => {
                    console.log(data);
                    // 체크된 단어 필터
                    const words = data.filter(row => row[CHECK_INDEX] == 'FALSE');
                    // 랜덤 정렬
                    if (sort) {
                        words.sort(() => Math.random() - 0.5);
                    }
                    props.setConfig({sheet, start, end, repeat, limit, erase, sort, words, data});
                });
            }}>시작</button>
            <button onClick={() => {
                fetch('/reset', {
                    method: 'POST',
                    body: JSON.stringify({ start, end, sheet }),
                });
            }}>초기화</button>
        </div>
        <button className="exit" onClick={e => props.setSheet(null)}>종료</button>
    </div>)
}