import { useState, useEffect, useContext } from "react";
import { ConfigContext } from "../context";

export default function Time(props) {
    const { config } = useContext(ConfigContext);
    const [start, setStart] = useState(!config.timeConfig ? Date.now() : config.timeConfig.start);
    const [end, setEnd] = useState(!config.timeConfig ? Date.now() : config.timeConfig.end);

    if (!config.timeConfig) config.timeConfig = {start: start, end: end};

    useEffect(() => {
        if (!props.stop) {
            config.timeConfig.end = Date.now();
            requestAnimationFrame(() => setEnd(config.timeConfig.end));
        }
    });

    useEffect(() => {
        config.timeConfig.start = start + Date.now() - end;
        setStart(config.timeConfig.start);
    }, [props.stop]);

    return <div>{new Date(end - start).toISOString().slice(11, -1)}</div>
}