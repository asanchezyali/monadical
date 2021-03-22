import React from 'react';
import Input from './Input'
import ChoiceButton from './ChoiceButton'

const InputForm = (props) => {
    const {stepBack, onSubmit, newGame, name, room} = props
    
    if (newGame){
        return (
            <div className="input-container">
                <Input 
                name='name'
                placeholder='Your Name...'
                value = {name}
                />
                <div className='nav-container'>
                    <ChoiceButton type='nav-back' choice='back' onChoice={stepBack} label='Back'/>
                    <ChoiceButton type='nav-forward' choice='submit' onChoice={onSubmit} label="Let's Go"/>
                </div>
            </div>
        )
    } else {
        return (
            <div className="input-container">
                <Input 
                    name='name'
                    placeholder='Your Name...'
                    value = {name}
                />
                <Input 
                    name='room'
                    placeholder='Room ID...'
                    value = {room}
                />
            <div className='nav-container'>
                <ChoiceButton type='nav-back' 
                    choice='back' 
                    onChoice={stepBack} 
                    label='Back'/>
                <ChoiceButton 
                    type='nav-forward' 
                    choice='submit' 
                    onChoice={onSubmit} 
                    label="Let's Go"/>
                
            </div>
            </div>
        )
    }
    
}

export default InputForm;
