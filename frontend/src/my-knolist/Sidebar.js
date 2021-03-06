import React from "react";
import { Sidenav, Icon, Nav } from "rsuite";
import { Link, useLocation } from "react-router-dom";

/*
    Nav.Item has a componentClass property set to span because
    of a warning generated by wrapping <a> within <a>,
    since Link and Nav.Item are transpiled to <a>
*/
function Sidebar() {
    let first = false;
    let second = false;
    let third = false;
    const location = useLocation()["pathname"];

    if (location === "/my-projects") first = true;
    else if (location === "/shared") second = true;
    else if (location === "/archived") third = true;

    return (
        <div style={{ width: "17vw" }}>
            <Sidenav
                style={{ height: "100vh", fontFamily: "Poppins", paddingTop: "3vh", paddingLeft: "1vh" }}>
                <Sidenav.Body>
                    <Nav>
                        <Link to="/my-projects" className="react-router-styling">
                            <Nav.Item active={first} icon={<Icon icon="project" />} componentClass="span">
                                My Projects
                            </Nav.Item>
                        </Link>
                        <Link to="/shared" className="react-router-styling">
                            <Nav.Item active={second} icon={<Icon icon="people-group" />} componentClass="span">
                                Shared with me
                            </Nav.Item>
                        </Link>
                        <Link to="/archived" className="react-router-styling">
                            <Nav.Item active={third} icon={<Icon icon="archive" />} componentClass="span">
                                Archived
                            </Nav.Item>
                        </Link>
                    </Nav>
                </Sidenav.Body>
            </Sidenav>
        </div>
    );
}

export default Sidebar;