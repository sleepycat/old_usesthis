import React from 'react'

export default class OrganizationProfile extends React.Component {

  listElements(technologies) {
    return(
      <p>
        <h5 className="profile_section_heading" >Technologies used</h5>
	<ul>
        {technologies.map((tech) => <li key={ btoa(this.props.name + tech.name) } className="technology" >{ tech.name }</li>)}
	</ul>
      </p>
    )
  }

  publicRepos() {
    if(typeof this.props.code == 'string'){
      return(
        <p>
          <h5 className="profile_section_heading">Public repos</h5>
          <a key={ btoa(this.props.name + this.props.code) }
            href={this.props.code}
            className="repo_link" >{ this.props.code }</a>
        </p>
      )
    }
  }

  render() {
    return(
      <div className="organization-detail">
	<h3>
	  <a href={ this.props.url } target="_blank">{ this.props.name }</a>
	</h3>
        { this.publicRepos() }
        { this.listElements(this.props.technologies) }
      </div>
    )
  }
}

