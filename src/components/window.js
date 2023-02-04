import { useContext } from "react";
import { ConfigContext } from "../context";
import { STATE_SET_SHEET, STATE_SET_WORD } from "../context/types";
import Mask from "../gui/mask";
import Config from "./config";
import Words from "./words";
import './window.scss';

export default function Window() {
    const { config, dispatch } = useContext(ConfigContext);
    
    if (config.state == STATE_SET_SHEET) {
        return <Mask>
            <Config />
        </Mask>
    // 테스트 창
    } else if (config.state == STATE_SET_WORD) {
        return <Mask>
            <Words />
        </Mask>
    }
}