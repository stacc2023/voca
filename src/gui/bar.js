import { useState, useEffect } from "react";
import styles from './bar.module.scss';

export default function Bar(props) {
    const [val, setVal] = useState(props.val || 0); 
    const [remains, setRemains] = useState(0);
    const {type, stop} = props;

    useEffect(() => {
        if (type == 'count') return;

        let requestId;
        const start = Date.now();
        let newVal = 0;
        const func = () => {
            newVal = remains + Date.now() - start;
            if (newVal < (props.max || 1000)) {
                setVal(newVal);
                requestId = requestAnimationFrame(func)
            } else {
                setVal(props.max || 1000);
                props.callback && props.callback();
            }
        }

        if (!val || (remains && !stop)) {
            requestId = requestAnimationFrame(func);            
        }

        // 언마운트, 애니메이션 종료
        return () => {
            setRemains(newVal);
            cancelAnimationFrame(requestId)
        }
    }, [stop])

    return <div className={styles.container} onClick={props.onClick}>
        <div className={styles.value} style={{
            width: (val / (props.max || 1000)) * 100 + "%",
            backgroundColor: type == 'count' ? 'cyan' : `rgb(${255 * (val / (props.max || 1000))}, ${255 * (1 - (val / (props.max || 1000))**5)}, 0)`,
        }}>{type == 'count' ? <div className={styles.cursor}></div>: null}</div>
        <div className={styles.text}>{props.children}</div>
    </div>
}