import { useContext } from "react";
import { ConfigContext } from "../context";
import { STATE_PLAY_CARD, STATE_PLAY_SHEET, STATE_SET_SHEET } from "../context/types";
import Mask from "../gui/mask";
import Config from "./config";
import Card from "./card";
import './window.scss';
import Sheet from "./sheet";

export default function Window() {
    const { config, dispatch } = useContext(ConfigContext);
    
    if (config.state == STATE_SET_SHEET) {
        return <Mask>
            <Config />
        </Mask>
    // 테스트 창
    } else if (config.state == STATE_PLAY_CARD) {
        return <Mask>
            <Card />
        </Mask>
    } else if (config.state == STATE_PLAY_SHEET) {
        return <Mask>
            <Sheet />
        </Mask>
    }
}