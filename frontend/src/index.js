import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';

import App from './app/App.js';
import KnolistAuthProvider from "./authentication/auth-provider";

ReactDOM.render(
    <Router>
        <KnolistAuthProvider>
            <App/>
        </KnolistAuthProvider>
    </Router>,
    document.getElementById('root')
);