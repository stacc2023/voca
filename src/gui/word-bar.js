import { useEffect, useRef, useState } from 'react';
import styles from './word-bar.module.scss';

const WORD_INDEX = 1;
const CHECK_INDEX = 0;

export default function WordBar({ config, setConfig }) {
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const { words, index } = config;
    
    const draw = ctx =>{
        const { width, height } = canvasRef.current;
        const size = words.length;
        const unit = width / size;
        const color = {'FALSE': 'rgba(100, 0, 0, 1)', 'TRUE': 'rgba(0, 100, 0, 1)'};
        let start;
        start = 0;
        for (let i=0; i < words.length; i++) {
            if (i == 0 || words[i - 1][0] == words[i][0]) continue;
            else {
                ctx.fillStyle = color[words[i - 1][0]];
                ctx.fillRect(start * unit, 0, (i - start) * unit, height);
                start = i;
            }
        }
        // 마지막 단위
        ctx.fillStyle = color[words[size - 1][0]];
        ctx.fillRect(start * unit, 0, (size - start) * unit, height);
    }

    useEffect(() => {
        const cursorWidth = cursorRef.current.getBoundingClientRect().width;
        const x = cursorRef.current.parentNode.getBoundingClientRect().x;
        const w = cursorRef.current.parentNode.getBoundingClientRect().width;
        const size = words.length;
        const unit = w / size;

        cursorRef.current.style.left = (index * unit) - cursorWidth / 2 + unit / 2 + 2 + 'px';

        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        draw(ctx);
        setCtx(ctx);
    }, []);

    window.onresize = e => {
        const { offsetWidth, offsetHeight } = canvasRef.current;
        canvasRef.current.width = offsetWidth;
        canvasRef.current.height = offsetHeight;
        if (ctx) {
            draw(ctx);
        }
    }

    const touchBar = e => {
        const cursorWidth = cursorRef.current.getBoundingClientRect().width;
        const x = e.currentTarget.getBoundingClientRect().x;
        const w = e.currentTarget.getBoundingClientRect().width;
        const size = words.length;
        const unit = w / size;
        // 절대 좌표 계산
        let newX = e.changedTouches ? e.changedTouches[0].clientX - x : e.clientX - x;
        if (newX < 0) newX = 0;
        if (newX > w - unit) newX = w - unit;
        // 단위 좌표 계산
        const newIndex = Math.floor(newX / w * size)
        newX = newIndex * unit - cursorWidth / 2 + unit / 2 + 2;
        cursorRef.current.style.left = newX + 'px';
        return newIndex;
    }

    // 맞은 개수와 틀린 개수 표기하기 위한 계산
    let yes = 0;
    let no = 0;
    for (let row of config.words) {
        if (row[CHECK_INDEX] == 'TRUE') yes++;
        else no++;
    }

    return (
        <div 
            className={styles.frame} 
            onTouchMove = {touchBar}
            onTouchEnd = {e => {
                const newIndex = touchBar(e);
                setConfig({ ...config, index: newIndex, cursor: WORD_INDEX, stop: false });
            }}
            >
            <canvas ref={canvasRef} className={styles.canvas} />
            <div className={styles.index}>
                <span>{index + 1 + ' / ' + words.length}</span>
                <span><span style={{color: 'lime'}}>{yes}</span> : <span style={{color: 'red'}}>{no}</span></span>
            </div>
            <div 
                className={styles.cursor}
                ref = {cursorRef}
            />
        </div>
    )
}