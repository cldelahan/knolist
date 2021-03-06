import React from "react";
import {Modal, Button, Form, FormGroup, ControlLabel, HelpBlock, FormControl} from "rsuite";

function NewProjectModal(props) {
    const show = props.show;
    const setShow = props.setShow;

    return (
        <Modal show={show} style={{overflow: "hidden"}} onHide={() => setShow(false)}>
            <Modal.Header><Modal.Title>New Project</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form fluid>
                    <FormGroup>
                        <ControlLabel>Title</ControlLabel>
                        <FormControl name="title"/>
                        <HelpBlock>Required</HelpBlock>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Description</ControlLabel>
                        <FormControl
                            rows={5}
                            name="description"
                            componentClass="textarea"/>
                    </FormGroup>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setShow(false)} appearance="primary">
                    Create
                </Button>
                <Button onClick={() => setShow(false)} appearance="default">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NewProjectModal;