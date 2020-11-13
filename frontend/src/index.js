import React from 'react';
import ReactDOM from 'react-dom';
import {
    Navbar,
    Nav,
    Button,
    FlexboxGrid,
    Drawer,
    Icon,
    IconButton,
    ButtonToolbar,
    Input,
    InputGroup,
    Dropdown,
    Checkbox,
    CheckboxGroup,
    Divider,
    Whisper,
    Tooltip,
    Modal,
    Placeholder
} from 'rsuite';
import {Network, DataSet} from 'vis-network/standalone';

// import default style
import 'rsuite/dist/styles/rsuite-default.css';
import './index.css';

import horizontalLogo from './images/horizontal_main.png';

class App extends React.Component {
    constructor(props) {
        super(props);
        const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczN2VjOWM1MTA2MDA2ZGUxNjFiYyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE2MDUyNzU4MDcsImV4cCI6MTYwNTM2MjIwNywiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.YQZTdqky4xBBDV6IrBTsS5eqx-7Z3y-aN6awHt35k9Ck8d4Jm64G2TalBUmJpV67JK6U9_6mFZatfzPZEDTUHHkoZZuqPKwoJ4Bwo2GJji0rA9gXgiwfr5YAYALs3ENL3BgKLnoKiSJYA9mr_kNvAL-YFJWLarXSlVWDCtIk7P_BIs-u_cqTOpm71zcOayl33u-7XA3hlkrHGwm_FDGpbWxUeUf0bYhWuZHXIr4KUK1HgaAV-H80-tuIA0ZsBwxv8rNP-cb0L7UAFGn9sidpi_AsLwSE3TzuRkj8ThtKON3y8yucyt4bxwjI716gTQ06zPLcEN61o2T36L0LjuZs1w";
        const baseUrl = "https://knolist-api.herokuapp.com";
        // const baseUrl = "http://localhost:5000"
        this.state = {
            curProject: JSON.parse(localStorage.getItem("curProject")),
            projects: null,
            showProjectsSidebar: false,
            jwt: jwt,
            baseUrl: baseUrl
        }
    }

    /**
     * Used to make standard requests to the Knolist API. Includes authorization.
     * @param endpoint The request endpoint (including the first slash). E.g., "/projects"
     * @param params The request parameters that would be used in the fetch call.
     * @returns {Promise<void>}
     */
    makeHttpRequest = async (endpoint, params = {}) => {
        const url = this.state.baseUrl + endpoint;
        // Add authorization to the request
        if (!params.hasOwnProperty("headers")) {
            params["headers"] = {};
        }
        params["headers"]["Authorization"] = "Bearer " + this.state.jwt;

        // Make request
        const response = await fetch(url, params).then(response => response.json())
        if (!response.success) {
            alert("Something went wrong!");
        }
        return response;
    }

    getProjects = async () => {
        const response = await this.makeHttpRequest("/projects");
        return response.projects;
    }

    switchShowProjectsSidebar = () => {
        this.setState({showProjectsSidebar: !this.state.showProjectsSidebar});
    }

    setCurProject = async (projectId) => {
        if (projectId === null) this.setState({curProject: null})
        else {
            const project = this.state.projects.find(x => x.id === projectId);
            this.setState({curProject: project});
        }
    }

    projectsButton = () => {
        return (
            <Button appearance="primary" id="projects-sidebar-btn" onClick={this.switchShowProjectsSidebar}>
                Your<br/>Projects
            </Button>
        );
    }

    componentDidMount() {
        this.getProjects().then(projects => {
            this.setState({projects: projects}, () => {
                if (projects.length > 0 && this.state.curProject === null) {
                    this.setState({curProject: projects[0]})
                }
            })
        });
    }

    componentDidUpdate(prevProps, prevState) {
        // Update localstorage whenever the curProject changes
        if (prevState.curProject !== this.state.curProject) {
            if (this.state.curProject === null) {
                this.setState({curProject: this.state.projects[0]})
            }
            localStorage.setItem("curProject", JSON.stringify(this.state.curProject));
        }
    }

    render() {
        return (
            <div>
                <AppHeader curProject={this.state.curProject} showSidebar={this.state.showProjectsSidebar}
                           switchShowSidebar={this.switchShowProjectsSidebar}/>
                <ProjectsSidebar show={this.state.showProjectsSidebar} curProject={this.state.curProject}
                                 makeHttpRequest={this.makeHttpRequest}
                                 close={this.switchShowProjectsSidebar} setCurProject={this.setCurProject}/>
                {this.projectsButton()}
                <MindMap makeHttpRequest={this.makeHttpRequest} curProject={this.state.curProject}/>
            </div>
        );
    }
}

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            network: null,
            visNodes: null,
            visEdges: null,
            selectedNode: null,
            sources: null
        }
    }

    setSelectedNode = (id) => {
        this.setState({selectedNode: id})
    }

    // Check if the network is in edit mode
    // isEditMode = () => {
    //     const visCloseButton = document.getElementsByClassName("vis-close")[0];
    //     return getComputedStyle(visCloseButton).display === "none"
    // }

    // Set selected node for the detailed view
    handleClickedNode = (id) => {
        this.setSelectedNode(id);
        // Only open modal outside of edit mode
        // if (this.isEditMode()) {
        //     this.setSelectedNode(id);
        // }
    }

    getSources = async (callback) => {
        if (this.props.curProject === null) return null;

        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        const response = await this.props.makeHttpRequest(endpoint);
        this.setState({sources: response.sources}, callback);
    }

    updateSourcePosition = async (sourceId, x, y) => {
        const endpoint = "/sources/" + sourceId;
        const params = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "x_position": x,
                "y_position": y
            })
        }
        this.props.makeHttpRequest(endpoint, params);
    }

    fitNetworkToScreen = () => {
        if (this.state.network !== null) {
            this.state.network.fit()
        }
    }

    /* Helper function to generate position for nodes
    This function adds an offset to  the randomly generated position based on the
    position of the node's parent (if it has one)
     */
    generateNodePositions(node) {
        let xOffset = 0;
        let yOffset = 0;
        // Update the offset if the node has a parent
        if (node.prev_sources.length !== 0) {
            const prevId = node.prev_sources[0];
            const prevNode = this.state.sources.find(x => x.id === prevId);
            // Check if the previous node has defined coordinates
            if (prevNode.x_position !== null && prevNode.y_position !== null) {
                xOffset = prevNode.x_position;
                yOffset = prevNode.y_position;
            }
        }
        // Helper variable to generate random positions
        const rangeLimit = 300; // To generate positions in the interval [-rangeLimit, rangeLimit]
        // Generate random positions
        const xRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);
        const yRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);

        // Return positions with offset
        return [xRandom + xOffset, yRandom + yOffset];
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.sources) {
            let node = this.state.sources[index];
            // Deal with positions
            if (node.x_position === null || node.y_position === null) {
                // If position is still undefined, generate random x and y in interval [-300, 300]
                const [x, y] = this.generateNodePositions(node);
                this.updateSourcePosition(node.id, x, y);
                nodes.add({id: node.id, label: node.title, x: x, y: y});
            } else {
                nodes.add({id: node.id, label: node.title, x: node.x_position, y: node.y_position});
            }
            // Deal with edges
            for (let nextIndex in node.next_sources) {
                const nextId = node.next_sources[nextIndex];
                edges.add({from: node.id, to: nextId})
            }
        }
        this.setState({visNodes: nodes, visEdges: edges});
        return [nodes, edges];
    }

    renderNetwork = () => {
        if (this.props.curProject === null) return;

        this.getSources(() => {
            const [nodes, edges] = this.createNodesAndEdges();

            // create a network
            const container = document.getElementById('mindmap');

            // provide the data in the vis format
            const data = {
                nodes: nodes,
                edges: edges
            };
            const options = {
                nodes: {
                    shape: "box",
                    size: 16,
                    margin: 10,
                    physics: false,
                    chosen: false,
                    font: {
                        face: "Apple-System",
                        color: "white"
                    },
                    color: {
                        background: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"]
                    },
                    widthConstraint: {
                        maximum: 500
                    }
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true
                        }
                    },
                    color: "black",
                    physics: false,
                    smooth: false,
                    hoverWidth: 0
                },
                interaction: {
                    selectConnectedEdges: false,
                    hover: true,
                    hoverConnectedEdges: false
                }
            };

            // Initialize the network
            const network = new Network(container, data, options);
            network.fit()

            // Handle click vs drag
            network.on("click", (params) => {
                if (params.nodes !== undefined && params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.handleClickedNode(nodeId);
                }
            });

            // Update positions after dragging node
            network.on("dragEnd", () => {
                // Only update positions if there is a selected node
                if (network.getSelectedNodes().length !== 0) {
                    const id = network.getSelectedNodes()[0];
                    const position = network.getPosition(id);
                    const x = position.x;
                    const y = position.y;
                    this.updateSourcePosition(id, x, y);
                }
            });

            // Set cursor to pointer when hovering over a node
            network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
            network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

            // Store the network
            this.setState({network: network});
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.curProject !== this.props.curProject) {
            this.renderNetwork();
        }
    }

    componentDidMount() {
        this.renderNetwork();
    }

    render() {
        if (this.props.curProject === null) return <Placeholder.Paragraph rows={20} active/>

        return (
            <div>
                <div id="mindmap"/>
                <SourceView selectedNode={this.state.selectedNode}
                            makeHttpRequest={this.props.makeHttpRequest}
                            setSelectedNode={this.setSelectedNode}/>
                <AppFooter fit={this.fitNetworkToScreen}/>
            </div>

        );
    }
}

class SourceView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceDetails: null
        }

    }

    close = () => {
        this.props.setSelectedNode(null);
    }

    getSourceDetails = async () => {
        if (this.props.selectedNode === null) {
            this.setState({sourceDetails: null});
            return;
        }
        const endpoint = "/sources/" + this.props.selectedNode;
        const response = await this.props.makeHttpRequest(endpoint);
        this.setState({sourceDetails: response.source});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedNode !== this.props.selectedNode) {
            this.getSourceDetails();
        }
    }

    componentDidMount() {
        this.getSourceDetails();
    }

    render() {
        if (this.props.selectedNode === null || this.state.sourceDetails === null) return null;

        const source = this.state.sourceDetails;
        return (
            <Modal full show onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>
                        <a target="_blank" rel="noopener noreferrer" href={source.url}>{source.title}</a>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <HighlightsList highlights={source.highlights}/>
                    <Divider/>
                    <NotesList notes={source.notes}/>
                </Modal.Body>
                <Modal.Footer>
                    <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Edit Source</Tooltip>}
                             placement="bottom">
                        <IconButton icon={<Icon icon="edit2"/>} size="lg"/>
                    </Whisper>
                    <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Delete Source</Tooltip>}
                             placement="bottom">
                        <IconButton icon={<Icon icon="trash"/>} size="lg"/>
                    </Whisper>
                </Modal.Footer>
            </Modal>

        );
    }
}

function HighlightsList(props) {
    // TODO: include link to the Chrome Extension on the store.
    return (
        <div>
            <h6 className="source-view-subtitle">{props.highlights.length > 0 ? "My Highlights" : "You haven't added any highlights yet."}</h6>
            {
                props.highlights.length === 0 ?
                    <p>To add highlights, use the <a href="#">Knolist Chrome Extension</a>.
                        Select text on a page, right-click, then click on "Highlight with Knolist".</p> :
                    null
            }
            <ul>
                {props.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}
            </ul>
        </div>
    )
}

function NotesList(props) {
    return (
        <div>
            <h6 className="source-view-subtitle">{props.notes.length > 0 ? "My Notes" : "You haven't added any notes yet."}</h6>
            <ul>
                {props.notes.map((notes, index) => <li key={index}>{notes}</li>)}
            </ul>
        </div>
    )
}

function AppHeader(props) {
    return (
        <Navbar style={{padding: "0 10px"}}>
            <FlexboxGrid justify="space-between" align="middle">
                <Navbar.Header>
                    <img className="limit-height" src={horizontalLogo} alt="Knolist"/>
                </Navbar.Header>
                <FlexboxGrid.Item>
                    <span id="project-title">
                        {
                            props.curProject === null ?
                                null :
                                "Current Project: " + props.curProject.title
                        }
                    </span>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item>
                    <SearchAndFilter/>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </Navbar>
    );
}

class AppFooter extends React.Component {
    render() {
        return (
            <div id="footer">
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Fit To Screen</Tooltip>}
                         placement="topStart">
                    <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="arrows-alt"/>} circle
                                size="lg" onClick={this.props.fit}/>
                </Whisper>
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>New Source</Tooltip>}
                         placement="topEnd">
                    <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="plus"/>} circle
                                size="lg"/>
                </Whisper>
            </div>
        )
    }
}

class SearchAndFilter extends React.Component {
    constructor(props) {
        super(props);
        // TODO: make backend endpoint to return the filter categories
        const filterCategories = [
            "Page Content",
            "URL",
            "Title",
            "Next Connections",
            "Previous Connections",
            "Highlights",
            "Notes"
        ]
        this.state = {
            indeterminate: false,
            checkAll: true,
            value: filterCategories,
            filterCategories: filterCategories
        };
        this.handleCheckAll = this.handleCheckAll.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleCheckAll(value, checked) {
        const nextValue = checked ? this.state.filterCategories : [];
        this.setState({
            value: nextValue,
            indeterminate: false,
            checkAll: checked
        });
    }

    handleChange(value) {
        this.setState({
            value: value,
            indeterminate: value.length > 0 && value.length < this.state.filterCategories.length,
            checkAll: value.length === this.state.filterCategories.length
        });
    }

    render() {
        return (
            <FlexboxGrid>
                <FlexboxGrid.Item><SearchBar/></FlexboxGrid.Item>
                <FlexboxGrid.Item>
                    <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Search Filters</Tooltip>}
                             placement="bottomEnd">
                        <Dropdown placement="bottomEnd" renderTitle={() => <IconButton icon={<Icon icon="filter"/>}/>}>
                            <div style={{width: 200}}>
                                <Checkbox indeterminate={this.state.indeterminate} checked={this.state.checkAll}
                                          onChange={this.handleCheckAll}>
                                    Select all
                                </Checkbox>
                                <Divider style={{margin: "5px 0"}}/>
                                <CheckboxGroup name="checkboxList" value={this.state.value}
                                               onChange={this.handleChange}>
                                    {this.state.filterCategories.map(filter => {
                                        return <Checkbox key={filter} value={filter}>{filter}</Checkbox>
                                    })}
                                </CheckboxGroup>
                            </div>
                        </Dropdown>
                    </Whisper>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        );
    }
}

function SearchBar() {
    return (
        <InputGroup style={{marginRight: 15}}>
            <Input placeholder="Search through your project"/>
            <InputGroup.Button>
                <Icon icon="search"/>
            </InputGroup.Button>
        </InputGroup>
    );
}

class ProjectsSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: null
        }
    }

    getProjects = async (callback) => {
        const endpoint = "/projects";
        const response = await this.props.makeHttpRequest(endpoint);
        this.setState({projects: response.projects}, callback);
    }

    renderProjectsList = () => {
        if (this.state.projects === null) return <Placeholder.Paragraph rows={15} active/>;

        return <ProjectsList projects={this.state.projects} curProject={this.props.curProject}
                             getProjects={this.getProjects} setCurProject={this.props.setCurProject}
                             makeHttpRequest={this.props.makeHttpRequest}/>
    }

    componentDidMount() {
        this.getProjects();
    }

    render() {
        return (
            <Drawer
                size="xs"
                show={this.props.show}
                onHide={this.props.close}>
                <Drawer.Header>
                    <Drawer.Title>Your Projects</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body style={{marginBottom: 10}}>
                    {this.renderProjectsList()}
                </Drawer.Body>
                <Drawer.Footer>
                    <IconButton appearance="primary" icon={<Icon icon="plus"/>} circle size="lg"/>
                </Drawer.Footer>
            </Drawer>
        )
    }
}

function ProjectsList(props) {
    return (
        <Nav vertical activeKey={props.curProject === null ? undefined : props.curProject.id}
             onSelect={(eventKey) => props.setCurProject(eventKey)}>
            {props.projects.map(project => <Project makeHttpRequest={props.makeHttpRequest} key={project.id}
                                                    getProjects={props.getProjects} project={project}
                                                    eventKey={project.id} setCurProject={props.setCurProject}/>)}
        </Nav>
    );
}

class Project extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDelete: false
        }
    }

    setDeleteProject = (event) => {
        event.stopPropagation();
        this.setState({confirmDelete: true})
    }

    resetDeleteProject = () => {
        this.setState({confirmDelete: false})
    }

    deleteProject = () => {
        const endpoint = "/projects/" + this.props.project.id;
        const params = {
            method: "DELETE"
        }
        this.props.makeHttpRequest(endpoint, params).then(() => {
            // Reset the current project if the deleted is active
            let callback;
            if (this.props.active) callback = () => this.props.setCurProject(null);
            this.props.getProjects(callback);
        });
    }

    generateConfirmDeletionWindow = () => {
        return (
            <Modal backdrop="static" show={this.state.confirmDelete} onHide={this.resetDeleteProject} size="xs">
                <Modal.Body>
                    <Icon
                        icon="remind"
                        style={{
                            color: '#ffb300',
                            fontSize: 24
                        }}
                    />
                    {'  '}
                    Are you sure you want to delete "{this.props.project.title}"?
                    <br/>
                    <b>This action cannot be undone.</b>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.deleteProject} appearance="primary">
                        Delete
                    </Button>
                    <Button onClick={this.resetDeleteProject} appearance="default">
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    render() {
        return (
            <div>
                {this.generateConfirmDeletionWindow()}
                <Nav.Item onSelect={this.props.onSelect} eventKey={this.props.eventKey} active={this.props.active}>
                    <FlexboxGrid justify="space-between">
                        <FlexboxGrid.Item>
                            {/*<Icon icon={"project"}/>*/}{this.props.project.title}
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item>
                            <ButtonToolbar>
                                <IconButton onClick={(e) => {
                                    e.stopPropagation();
                                    alert('edit');
                                }} icon={<Icon icon="edit2"/>} size="sm"/>
                                <IconButton onClick={this.setDeleteProject} icon={<Icon icon="trash"/>} size="sm"/>
                            </ButtonToolbar>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </Nav.Item>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>
    , document.getElementById('root'));