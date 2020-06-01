import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './custom.css';
import Loading from './components/Loading';

import Desktop from './desktop/index';

const App = () => {
    return (
        < React.Fragment>
            < Desktop />
        </React.Fragment>
    )
}

export default App