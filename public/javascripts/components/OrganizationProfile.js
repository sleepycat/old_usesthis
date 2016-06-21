import React from 'react'

export default class OrganizationProfile extends React.Component {

  listElements(technologies) {
    return  technologies.map((tech) => <li key={ btoa(this.props.name + tech.name) } className="technology" >{ tech.name }</li>)
  }

  render() {
    return(
      <div className="organization-detail">
	<p>
	  <a href={ this.props.url } target="_blank">{ this.props.name }</a>
	</p>
	<ul>
           { this.listElements(this.props.technologies) }
	</ul>
      </div>
    )
  }
}

