import React from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton
} from "rsuite";

// Primarily pulled from app header

class MiniGames5 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // newSourceUrlId: "new-source-url",
            loading: false
        }
    }
    render() {

        return (
            <h1>MiniGames5</h1>
        );
    }
}

export default MiniGames5;
