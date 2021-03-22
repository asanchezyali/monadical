import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Start from './components/Start'
import Board from './components/Board/index'

import { Provider } from 'react-redux';
import store from './redux/store';

function App() {
  return (
    <Router>
        <Provider store={store}>
            <Switch>
            <Route path='/' exact component={Start} />
            <Route path='/game' component={Board} />
            </Switch>
        </Provider>
    </Router>
  );
}

export default App;