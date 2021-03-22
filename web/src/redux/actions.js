export const UPDATE_STEP = 'UPDATE_STEP'

export const updateStep = (payload) => {
    return {
        type: UPDATE_STEP,
        payload: payload
    }
}

export const UPDATE_NAME = 'UPDATE_NAME'

export const updateName = (payload) => {
    return {
        type: UPDATE_NAME,
        payload: payload
    }
}

export const UPDATE_NEWGAME = 'UPDATE_NEWGAME'

export const updateNewGame = (payload) => {
    return {
        type: UPDATE_NEWGAME,
        payload: payload
    }
}


export const UPDATE_ROOM = 'UPDATE_ROOM'

export const updateRoom = (payload) => {
    return {
        type: UPDATE_ROOM,
        payload: payload
    }
}


export const UPDATE_LOADING = 'UPDATE_LOADING'

export const updateLoading = (payload) => {
    return {
        type: UPDATE_LOADING,
        payload: payload
    }
}

export const UPDATE_SERVER_CONFIRMED = 'UPDATE_SERVER_CONFIRMED'

export const updateServerConfirmed = (payload) => {
    return {
        type: UPDATE_SERVER_CONFIRMED,
        payload: payload
    }
}

export const UPDATE_ERROR = 'UPDATE_ERROR'

export const updateError = (payload) => {
    return {
        type: UPDATE_ERROR,
        payload: payload
    }
}

export const UPDATE_ERROR_MESSAGE = 'UPDATE_ERROR_MESSAGE'

export const updateErrorMessage = (payload) => {
    return {
        type: UPDATE_ERROR_MESSAGE,
        payload: payload
    }
}