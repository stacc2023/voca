import { createContext, useReducer } from "react"
import { CHECK_COLUMN, CHECK_FALSE, CHECK_TRUE, INIT_LIMIT, INIT_MEANLIMIT, MEAN_COLUMN, STATE_IDLE, TEST_SET_SHEET, WORD_COLUMN } from "./types";


const initConfig = {
    sheet: null,
    state: STATE_IDLE,
    start: 1,
    end: '',
    repeat: '',
    limit: INIT_LIMIT,
    meanLimit: INIT_MEANLIMIT,
    erase: false,
    sort: false,
    speach: false,
    uk: false,
    merge: false,
    speachLimit: false,
    repeatSort: false,
    index: 0,
    cursor: WORD_COLUMN,
    stop: false,
}

const ConfigContext = createContext({});


function passable(state) {
    for (let i = state.index - state.repeat + 1; i <= state.index; i++) {
        if (state.words[i][CHECK_COLUMN] == 'FALSE') return false
    }
    return true;
}

function next(state, force) {
    // 기본 동작은 index + 1 & column = word
    // if action.auto : 반복 구간의 끝, 또는 반복이 설정된 상태에서 마지막에 도달하면 검토 후 반복 여부 결정
    // if !action.auto : 마지막인 경우 동작 x

    // force=false and repeat>0 and (index=n*repeat 또는 마지막 단어) and 범위 안에 틀린 단어 존재
    if (!force && state.repeat && (state.index % state.repeat == state.repeat - 1 || state.index == state.words.length - 1) && !passable(state)) {

        // 다시 섞기
        if (state.repeatSort) {
            let suffled = state.words.slice(state.index - state.repeat + 1, state.index + 1);
            suffled.sort(() => Math.random() - 0.5);
            state.words.splice(state.index - state.repeat + 1, state.repeat, ...suffled);
        }

        return { ...state, index: state.index - state.repeat + 1, cursor: WORD_COLUMN, stop:false };
    }

    // 마지막 단어가 아닌 경우
    else if (state.index < state.words.length - 1) {
        return { ...state, index: state.index + 1, cursor: WORD_COLUMN, stop:false };
    }

    // 마지막 단어
    return state;
}

function prev(state) {
    // 뜻인 경우 같은 인덱스의 단어로
    if (state.cursor == MEAN_COLUMN) {
        return { ...state, cursor: WORD_COLUMN, stop: false };
    }

    // 인덱스가 0보다 큰 경우 이전 단어로
    else if (state.index > 0) {
        return { ...state, index: state.index - 1, cursor: WORD_COLUMN, stop: false };
    }

    return state;
}

function check(state, answer) {
    // 기본 동작은 단어 -> 뜻 | 뜻 -> 뜻
    state.words[state.index][CHECK_COLUMN] = answer ? CHECK_TRUE : CHECK_FALSE;
    return { ...state, cursor: MEAN_COLUMN, stop: false, };
}

const reducer = (state = initConfig, action) => {
    switch(action.type) {
        case 'reset' :
            return initConfig;
        case 'update' :
            return { ...state, ...action.value };
        case 'check' :
            return check(state, action.answer);
        case 'next' :
            return next(state, action.force);
        case 'prev' :
            return prev(state);
        default :
            return state;
    }
};

const Provider = ({ children }) => {
    const [ config, dispatch ] = useReducer(reducer, initConfig);
    const value = { config, dispatch };
    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export { ConfigContext, Provider };