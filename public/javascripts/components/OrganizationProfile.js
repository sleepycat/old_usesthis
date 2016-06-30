import React from 'react'

export default class OrganizationProfile extends React.Component {

  listElements(technologies) {
    return  technologies.map((tech) => <li key={ btoa(this.props.name + tech.name) } className="technology" >{ tech.name }</li>)
  }

  publicRepos() {
    if(typeof this.props.code == 'string'){
      return  <p><a key={ btoa(this.props.name + this.props.code) } href={this.props.code} className="repo" >{ this.props.code }</a></p>
    }
  }

  render() {
    return(
      <div className="organization-detail">
	<h3>
	  <a href={ this.props.url } target="_blank">{ this.props.name }</a>
	</h3>
        { this.publicRepos() }
	<ul>
           { this.listElements(this.props.technologies) }
	</ul>
      </div>
    )
  }
}

