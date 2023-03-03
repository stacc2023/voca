import { useContext } from "react";
import { ConfigContext } from "../context";
import { STATE_SET_SHEET, WORD_COLUMN, MEAN_COLUMN, CHAPTER_COLUMN, CHECK_COLUMN } from "../context/types";
import ButtonFrame from '../gui/button';
import "./sheet.scss";

export default function Sheet(props) {
    const { config, dispatch } = useContext(ConfigContext);

    return (<div className="sheet">
        <div className="table">
            <table>
                <thead>
                    <tr>
                        <td>단어</td>
                        <td>뜻</td>
                        {/* <td>뜻</td> */}
                    </tr>
                </thead>
                <tbody>
                    {
                        config.words.map(row => {
                            let result = []
                            const checks = row[CHECK_COLUMN].split(',');
                            const words = row[WORD_COLUMN].split(',');
                            const means = row[CHAPTER_COLUMN].split('|');

                            const touchEffect = index => e => {
                                if (!config.touchSheet) {
                                    e.target.textContent=means[index];
                                    setTimeout(() => {
                                        e.target.textContent=words[index];
                                    }, 500)
                                } else {
                                    // 나중에 필요하면 구현
                                    if (row[CHECK_COLUMN] == 'FALSE') {
                                        row[CHECK_COLUMN] = 'TRUE';
                                        e.target.classList.add('checked');
                                    } else {
                                        row[CHECK_COLUMN] = 'FALSE';
                                        e.target.classList.remove('checked');
                                    }
                                    console.log(config.data);
                                }
                            }

                            const toggleMean = e => {
                                e.target.classList.remove('hide');
                                setTimeout(() => {
                                    e.target.classList.add('hide');
                                }, 1000);
                            }

                            // 첫번째 단어
                            result.push([<tr>
                                <td className={checks[0] == 'TRUE' ? 'first checked':'first'} onClick={touchEffect(0)}>{words[0]}</td>
                                <td className="first hide" rowspan={words.length} onClick={toggleMean}>{row[MEAN_COLUMN]}</td>
                            </tr>])
                            // 단어가 여러개면 길어짐
                            for (let i=1; i < words.length; i++) {
                                result.push(<tr>
                                    <td className={checks[0] == 'TRUE' ? 'others checked':'others'} onClick={touchEffect(i)}>{words[i]}</td>
                                </tr>)
                            }
                            return result
                        })
                    }
                </tbody>
            </table>
        </div>
        <ButtonFrame className="top right">
            {config.touchSheet ? 
            <button onClick={e => {
                e.target.disabled=true;
                fetch('/erase', {
                    method: 'POST',
                    body: JSON.stringify(config),
                }).then(res => res.json()).then(result => {
                    e.target.disabled=false;
                });
            }}>저장</button>
            : null}
            <button onClick={e => {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                dispatch({
                    type: 'update',
                    value: {
                        state: STATE_SET_SHEET,
                        words: null,
                        data: null,
                    }
                });
            }}>종료</button>
        </ButtonFrame>
    </div>)
}