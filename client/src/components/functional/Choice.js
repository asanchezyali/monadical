import React from 'react';
import ChoiceButton from './ChoiceButton'

const Choice = ({logo, onChoice}) => {
    return (
        <>
            <div className='choice-container'>
                <a href="/"><img src={logo} alt='React Side Stacker'/></a>
                <ChoiceButton onChoice={onChoice} type='primary' choice='new' label='Start New'/>
                <ChoiceButton onChoice={onChoice} type='secondary' choice='join' label='Join Game'/>
                <ChoiceButton onChoice={onChoice} type='secondary' choice='new bot' label='Bot'/>
            </div>
        </>
    );
}

export default Choice;
