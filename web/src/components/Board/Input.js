import React from 'react'
import { useDispatch } from 'react-redux'
import {
    updateRoom,
    updateName
} from '../../redux/actions'

const Input = (props) => {
    const {name, placeholder, value} = props
    const dispatch = useDispatch()

    const onTyping = (e)=>{
        if (e.target.name === 'name'){
            dispatch(updateName(e.target.value))
        }
        if (e.target.name === 'room')
            dispatch(updateRoom(e.target.value))
    }

    return (
        <input 
            autoComplete='off' 
            type="text" 
            name={name} 
            id={name} 
            placeholder={placeholder} 
            value={value} 
            onChange={onTyping}
        />
    );
}

export default Input;