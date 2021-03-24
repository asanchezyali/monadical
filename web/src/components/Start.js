import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Redirect} from 'react-router-dom'

import Choice from './Board/Choice'
import InputForm from './Board/InputForm'
import Loading from './Board/Loading'
import Error from './Board/Error'
import logo from './logo.png'

import io from "socket.io-client"

import {updateError, updateErrorMessage, updateLoading, updateNewGame, updateStep,} from '../redux/actions'

const socket = io.connect("http://localhost:4000")


const Start = () => {

    const [state, setState] = useState({
        room: '',
        serverConfirmed: false,
    })

    const dispatch = useDispatch()
    const globalState = useSelector(store => store.state)

    useEffect(() => {
        socket.on('newGameCreated', (room) => {
            setState(state => ({...state, serverConfirmed: true, room: room}))
        })
        socket.on('joinConfirmed', () => {
            setState(state => ({...state, serverConfirmed: true}))
        })
        socket.on('errorMessage', (message) => displayError(message))
        return () => {
            socket.disconnect()
        }
    }, [])


    const onChoice = (choice) => {
        const gameChoice = choice === 'new'
        dispatch(updateNewGame(gameChoice))
        dispatch(updateStep(globalState.step + 1))
    }

    const validate = () => {
        if (globalState.newGame) {
            return !(globalState.name === '')
        } else {
            return !(globalState.name === '') && !(globalState.room === '')
        }
    }

    const onSubmit = () => {
        dispatch(updateLoading(true))
        if (validate()) {
            if (globalState.newGame) {
                socket.emit('newGame')
            } else {
                console.log(globalState.room)
                socket.emit('joining', {room: globalState.room})
            }
        } else {
            setTimeout(() => dispatch(updateLoading(false)), 500)
            displayError(globalState.newGame ? 'Please fill out your name' : 'Please fill out your name and room id')
        }
    }

    const stepBack = () => {
        dispatch(updateStep(globalState.step - 1))
    }

    const displayError = (message) => {
        dispatch(updateError(true))
        dispatch(updateErrorMessage(message))
        dispatch(updateLoading(false))
        setTimeout(() => {
            dispatch(updateError(false))
            dispatch(updateErrorMessage(''))
        }, 3000)
    }

    if (state.serverConfirmed) {
        return (
            <Redirect to={`/game?room=${state.room}&name=${globalState.name}`}/>
        )
    } else {
        switch (globalState.step) {
            case(1):
                return (
                    <Choice logo={logo} onChoice={onChoice}/>
                );
            case(2):
                return (
                    <>
                        <Loading loading={globalState.loading}/>
                        <Error display={globalState.error} message={globalState.errorMessage}/>
                        <InputForm
                            stepBack={stepBack}
                            onSubmit={onSubmit}
                            newGame={globalState.newGame}
                            name={globalState.name}
                            room={globalState.room}/>
                    </>
                );
            default:
                return null
        }
    }

}


export default Start