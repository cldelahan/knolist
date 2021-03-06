import React from "react";
import { Panel } from "rsuite";
import { Link } from "react-router-dom";

function ProjectCard(props) {
  const openProject = (project) => {
    localStorage.setItem("curProject", JSON.stringify(project));
    //set current project to selected project
  }

  // uncomment below when shared projects are implemented
  /*if (props.project.shared) {
    return (
      <Panel shaded bordered header={props.data.title} style={{ width: "17vw", marginTop: "2vh" }}>
        {props.data.id}
        <Icon icon="people-group" />
      </Panel>
    );
  } else {*/
  return (
    <Link to="/" style={{ textDecoration: "none"}} className="react-router-styling">
      <Panel
        shaded bordered
        header={props.data.title}
        style={{ width: "17vw", marginTop: "2vh" }}
        onClick={() => openProject(props.data)}>
        {props.data.id}
      </Panel>
    </Link>
  );
  //}
}

export default ProjectCard;