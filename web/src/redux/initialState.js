import {
    UPDATE_STEP,
    UPDATE_NAME,
    UPDATE_NEWGAME,
    UPDATE_ROOM,
    UPDATE_LOADING,
    UPDATE_SERVER_CONFIRMED,
    UPDATE_ERROR,
    UPDATE_ERROR_MESSAGE
} from './actions'


const initialState = {
    step: 1,
    name: '',
    newGame: null,
    room: '',
    loading: false,
    serverConfirmed: false,
    error: false,
    errorMessage: '',
}

export default function(state=initialState, action) {
    switch (action.type) {
        case UPDATE_STEP:
            return {...state, step: action.payload}

        case UPDATE_NAME:
            return {...state, name: action.payload}

        case UPDATE_NEWGAME:
            return {...state, newGame: action.payload}        

        case UPDATE_ROOM:
            return {...state, room: action.payload}

        case UPDATE_LOADING:
            return {...state, loading: action.payload}

        case UPDATE_SERVER_CONFIRMED:
            return {...state, serverConfirmed: action.payload}

        case UPDATE_ERROR:
            return {...state, error: action.payload}
        
        case UPDATE_ERROR_MESSAGE:
            return {...state, errorMessage: action.payload}

        default:
            return state
        
    }
}