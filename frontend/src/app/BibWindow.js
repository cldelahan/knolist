import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, 
    CheckboxGroup, Tooltip, Whisper, Input, Divider, Alert, Button
} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        const formats = {
            APA: "APA Reference List",
            MLA: "MLA Works Cited",
            CHI: "Chicago Bibliography Style"
        }
        //var included = new Array()
        this.state = {
            sources: null,
            curFormat: formats.APA,
            formats: formats,
            editSource: null
            //included: included
        }
    }

    // Make API call to get all sources 
    getBibSources = async (callback) => {
        if (this.props.curProject === null) return null;
        // this.setLoading(true);

        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        const response = await makeHttpRequest(endpoint);
        //this.setLoading(false);
        this.setState({sources: response.body.sources}, callback);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.showBib !== this.props.showBib && this.props.showBib) {
            this.getBibSources();
        }
    }

    componentDidMount() {
        this.getBibSources();
    }

    // Called when checkbox changed
    // Changes citation is_included field based on if checkbox is checked or not
    // changeInclusion = async (checked,source) => {
    //     console.log("onChange");
    //     console.log(checked);
    //     const endpoint = "/sources/" + source.id;
    //     var body = null;
    //     // var body = {
    //     //     "is_included" : true
    //     // }
    //     if (checked) {
    //         console.log("checked");
    //         body = {
    //             "is_included" : true
    //         }
    //     } else {
    //         console.log("unchecked");
    //         body = {
    //             "is_included" : false
    //         }
    //     }
    //     //makeHttpRequest(endpoint, "PATCH", body).then(() => this.getBibSources());
    //     await makeHttpRequest(endpoint, "PATCH", body);
    //     this.getBibSources();
    // }

    // Called when checkbox changed
    // Changes citation is_included field to true
    addToSaved = async (source) => {
    //addToSaved = async (checked,source) => {
        const endpoint = "/sources/" + source.id;
        var body = null;
        body = {
            "is_included" : true
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.getBibSources();
    }

    // Called when checkbox changed
    // Changes citation is_included field to false
    removeFromSaved = async (source) => {
    //removeFromSaved = async (checked,source) => {
        const endpoint = "/sources/" + source.id;
        var body = null;

        body = {
            "is_included" : false
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.getBibSources();
    }

    // Copies citations in top section (those with is_included === true)
    // onto clipboard with formatting
    copyBib() {
        const citationArray = document.getElementsByClassName('copyText')
        var selectText = "";
        for (var i=0; i < citationArray.length; i++) {
            selectText = selectText.concat(citationArray[i].innerHTML);
            selectText = selectText.concat('<br><br>');
        }
        function listener(e) {
            e.clipboardData.setData("text/html", selectText);
            e.clipboardData.setData("text/plain", selectText);
            e.preventDefault();
        }
        document.addEventListener("copy", listener);
        document.execCommand("copy");
        document.removeEventListener("copy", listener);
        Alert.info('Copied Citations to Clipboard');
    };

    changeFormatType = (value) => {
        this.setState({
            curFormat: value
        });
    }

    // Check if citation has all source fields present
    // Displays a Missing! icon if not
    showMissingIcon = (source) => {
        //this.getBibSources();
        if(source.title && source.url && source.author 
            && source.published_date && source.site_name 
            && source.access_date) {
            return null;
        } else {
            const citationFields = ['title ', 'URL ', 'author ', 'publish date ', 'site name ', 'access date ']
            var missing = ""
            if (!source.title) {
                missing = missing.concat(citationFields[0])
            }
            if (!source.url) {
                missing = missing.concat(citationFields[1])
            }
            if (!source.author) {
                missing = missing.concat(citationFields[2])
            }
            if (!source.publishDate) {
                missing = missing.concat(citationFields[3])
            }
            if (!source.siteName) {
                missing = missing.concat(citationFields[4])
            }
            if (!source.accessDate) {
                missing = missing.concat(citationFields[5])
            }
            return(
                <Whisper placement="bottomStart" trigger="hover" speaker={<Tooltip>This citation is missing the <i>{missing}</i>field(s)</Tooltip>}>
                    <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                </Whisper>
            );
        }
    }

    // Renders citation in APA, MLA, or Chicago format
    renderFormatType = (source) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        var formattedDate = "";
        var title = "";
        var author = "";
        var publishDateJS = new Date(source.published_date);
        var accessDateJS = new Date(source.access_date);
        if (this.state.curFormat === this.state.formats.APA){
            // if publishDate None, use accessDate
            if (source.published_date) {
                formattedDate = formattedDate.concat("(");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getDate());
                formattedDate = formattedDate.concat("). ");
            } else if (source.access_date) {
                formattedDate = formattedDate.concat("(");
                formattedDate = formattedDate.concat(accessDateJS.getFullYear());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(months[accessDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(accessDateJS.getDate());
                formattedDate = formattedDate.concat("). ");
            }
            if (source.title) {
                title = title.concat(source.title);
                title = title.concat(".");
            }
            if (source.author) {
                author = author.concat(source.author);
                author = author.concat(".");
            }
            return (
                <p className={this.isIncludedClassName(source.is_included)}>{author} {formattedDate} 
                <i>{title}</i> {source.site_name}. <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.url}.</a><EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/></p>
            );
        } else if (this.state.curFormat === this.state.formats.CHI){
            // if publishDate None, use accessDate
            if (source.published_date) {
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getDate());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            } else if (source.access_date) {
                formattedDate = formattedDate.concat(months[accessDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(accessDateJS.getDate());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(accessDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            }
            if (source.title) {
                title = title.concat("\"");
                title = title.concat(source.title);
                title = title.concat(".\"");
            }
            if (source.author) {
                author = author.concat(source.author);
                author = author.concat(".");
            }
            return (
                <p className={this.isIncludedClassName(source.is_included)}>{author} {title} 
                <i>{source.site_name}</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.url}.</a><EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/></p>
            );
        } else if (this.state.curFormat === this.state.formats.MLA) {
            if (source.published_date) {
                formattedDate = formattedDate.concat(publishDateJS.getDate());
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            }
            var formattedDate2 = "";
            if (source.access_date) {
                formattedDate2 = formattedDate2.concat("Accessed ");
                formattedDate2 = formattedDate2.concat(accessDateJS.getDate());
                formattedDate2 = formattedDate2.concat(" ");
                formattedDate2 = formattedDate2.concat(months[accessDateJS.getMonth()]);
                formattedDate2 = formattedDate2.concat(" ");
                formattedDate2 = formattedDate2.concat(accessDateJS.getFullYear());
                formattedDate2 = formattedDate2.concat(".");
            }
            if (source.title) {
                title = title.concat("\"");
                title = title.concat(source.title);
                title = title.concat(".\"");
            }
            if (source.author) {
                author = author.concat(source.author);
                author = author.concat(".");
            }
            return (
                <p className={this.isIncludedClassName(source.is_included)}>{author} {title} 
                <i>{source.site_name}</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.url}.</a> {formattedDate2} <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/></p>
            );
        }
    }

    // Sets className to copyText if citation is included to copy to clipboard
    // Else sets className to undefined
    isIncludedClassName = (included) => {
        if (included) {
            return ('copyText');
        } else {
            return (undefined);
        }
    }

    // Keeps track if Bibliography Generation Button clicked and Window should open
    setEditSource = (source) => {
        this.setState({
            editSource: source
        });
    }

    render() {
        const formats = this.state.formats;
        const dropdownData = [{value:formats.APA,label:formats.APA},{value:formats.MLA,label:formats.MLA},{value:formats.CHI,label:formats.CHI}]
        if (this.state.sources === null) return null;
        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header style={{marginRight: "5%"}}>
                    <Modal.Title>
                    Bibliography 
                    <IconButton onClick={this.copyBib} icon={<Icon icon="copy"/>}/>
                    <SelectPicker defaultValue={formats.APA} data={dropdownData} onChange={this.changeFormatType} style={{float: 'right'}} cleanable={false} searchable={false}/>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        {
                            // eslint-disable-next-line
                            this.state.sources.map((source,index) => 
                            {if (source.is_included === true) { 
                                return(
                                    <Checkbox defaultChecked onChange={() => this.removeFromSaved(source)} key={index}>
                                        {this.renderFormatType(source)}
                                        {this.showMissingIcon(source)}
                                    </Checkbox>
                                );
                            }}
                        )}
                        <Divider/>
                        {
                            // eslint-disable-next-line
                            this.state.sources.map((source,index) => 
                            {if (source.is_included === false) { 
                                return(
                                    <Checkbox defaultChecked={false} style={{color: '#d3d3d3'}} onChange={() => this.addToSaved(source)} key={index}>
                                        {this.renderFormatType(source)}
                                        {this.showMissingIcon(source)}
                                    </Checkbox>
                                );
                            }}
                        )}
                    </CheckboxGroup>
                </Modal.Body>
            <EditWindow close={() => this.setEditSource(null)} source={this.state.editSource} getBibSources={this.getBibSources}/>
            </Modal>
        );
    }
}

class EditCitationButton extends React.Component{
    render () {
        const buttonSize = "xs";
        return (
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Edit Citation Fields</Tooltip>} placement="top">
                <IconButton icon={<Icon icon="edit2"/>} size={buttonSize} onClick={() => this.props.setEditSource(this.props.source)}/>
            </Whisper>
        );
    }
}

class EditWindow extends React.Component{
    // Show DefaultValue or Placeholder in Edit Input
    showField = (field) => {
        if(field){
            return (field);
        } else {
            return (undefined);
        }
    }

    // Make API call to update citation fields
    changeAuthor = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "author" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.props.getBibSources();
    }

    changeTitle = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "title" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.props.getBibSources();
    }

    changePublishDate = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "published_date" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.props.getBibSources();
    }

    changeSiteName = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "site_name" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.props.getBibSources();
    }

    changeAccessDate = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "access_date" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.props.getBibSources();
    }

    changeURL = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "url" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.props.getBibSources();
    }

    render() {
        if (this.props.source === null) return null;
        return (
            <Modal full show onHide={this.props.close}>
                <Modal.Header>
                    <Modal.Title>
                    Edit Citation Fields
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Author: <Input defaultValue={this.showField(this.props.source.author)} onChange={this.changeAuthor} style={{ width: '300px' }}/></p>
                    <p>Title: <Input defaultValue={this.showField(this.props.source.title)} onChange={this.changeTitle} style={{ width: '500px' }}/></p>
                    <p>Publish Date: <Input defaultValue={this.showField(this.props.source.published_date)} onChange={this.changePublishDate} style={{ width: '300px' }}/></p>
                    <p>Site Name: <Input defaultValue={this.showField(this.props.source.site_name)} onChange={this.changeSiteName} style={{ width: '300px' }}/></p>
                    <p>Access Date: <Input defaultValue={this.showField(this.props.source.access_date)} onChange={this.changeAccessDate} style={{ width: '300px' }}/></p>
                    <p>URL: <Input defaultValue={this.showField(this.props.source.url)} onChange={this.changeURL} style={{ width: '400px' }}/></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.close}>Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default BibWindow;