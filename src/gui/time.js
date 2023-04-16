import { useState, useEffect } from "react";

export default function Time(props) {
    const [start, setStart] = useState(Date.now());
    const [cur, setCur] = useState(Date.now());

    useEffect(() => {
        if (!props.stop) {
            requestAnimationFrame(() => setCur(Date.now()));
        }
    });

    useEffect(() => {
        setStart(start + Date.now() - cur);
    }, [props.stop]);

    return <div>{new Date(cur - start).toISOString().slice(11, -1)}</div>
}