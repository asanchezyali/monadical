
import React, { useState, useRef, useEffect} from 'react'
import Choice from './Board/Choice'
import InputForm from './Board/InputForm'
import Loading from './Board/Loading'
import Error from './Board/Error'
import logo from './logo.png'

import {Redirect} from 'react-router-dom'

import io from "socket.io-client"
const socket = io.connect("http://localhost:4000")


const Start = (p) => {

    const [state, setState] = useState({
        step: 1,
        name: '',
        newGame: null,
        room: '',
        loading: false,
        serverConfirmed: false,
        error: false,
        errorMessage: '',
    })


    useEffect(() => {        
        socket.on('newGameCreated', (room) =>{
            console.log('A new game created.')
            setState({serverConfirmed:true, room:room})
        })

        socket.on('joinConfirmed', ()=>{
            setState({serverConfirmed:true})
        })

        socket.on('errorMessage', (message) => displayError(message))
        return () => {
            socket.disconnect()
        }, []
    })

    const onChoice = (choice)=>{
        console.log('Your election is for a new game')
        const gameChoice = choice==='new'?true:false
        const newState = {newGame: gameChoice}
        setState(newState)
        setState({step: state.step + 1})
    }

    const validate = ()=>{
        if (state.newGame){
            return !(state.name==='')
        } else {
            return !(state.name==='') && !(state.room==='')
        }
    }

    const onSubmit = ()=>{
        setState({loading: true})
        if (validate()){
            if (state.newGame){
                socket.emit('newGame')
            } else {
                socket.emit('joining', { room:state.room })
            }
        } else {
            setTimeout(()=>setState({ loading: false }), 500)
            displayError(state.newGame? 'Please fill out your name':'Please fill out your name and room id')
        }
    }

    const stepBack = ()=>{
        setState({step: state.step - 1})
    }

    const stepForward = () =>{
        setState({step: state.step + 1})
    }

    const onTyping = (e)=>{
        console.log(e.target.name)
        const target = e.target.name
        const newState = {[target]:e.target.value}
        console.log('estoy puto')
        setState(newState)
    }

    const displayError = (message) =>{
        setState({error:true, errorMessage:message, loading:false})
        setTimeout(()=>{
            setState({error:false, errorMessage:''})
        }, 3000)
    }

    if (state.serverConfirmed){
        return(
            <Redirect to={`/game?room=${state.room}&name=${state.name}`} />
        )
    } else {
        switch(state.step){
            case(1):
                return (
                    <Choice logo={logo} onChoice={onChoice}/>
                );
            case(2):
                return (
                    <>
                        <Loading loading={state.loading}/>
                        <Error display={state.error} message={state.errorMessage}/>
                        <InputForm 
                            stepBack={stepBack} 
                            onSubmit={onSubmit} 
                            onTyping={e => onTyping(e)}
                            newGame={state.newGame}
                            name = {state.name}
                            room = {state.room}/> 
                    </>
                );
            default:
                return null
        }
    }
    
}


export default Start