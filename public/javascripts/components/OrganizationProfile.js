import React, { Component } from 'react'
import Radium, { Style } from 'radium'
import Color from 'color'

let style = {
  heading: {
    color: '#4682B4',
    fontSize: '1.1em'
  },
  detail: {
    padding: '1em'
  },
  link: {
    color: '#4682B4',
    ':visited': {
      color: Color('#4682B4').darken(0.2).string()
    }
  },
  repoLink: {
    marginLeft: '1em',
    color: '#4682B4',
    ':visited': {
      color: Color('#4682B4').darken(0.2).string()
    }
  },
  technology: {
    listStyleType: 'none',
    color: '#eee',
    padding: '0',
    backgroundColor: '#4682B4',
    borderBottom: '1px solid #B3CEE1',
    borderRight: '1px solid #B3CEE1',
    padding: '3px 4px',
    margin: '2px 2px 2px 0px',
    textDecoration: 'none',
    fontsize: '90%',
    lineheight: '1.4em',
    whitespace: 'nowrap',
    display: 'inline-block'
  }
}

class OrganizationProfile extends Component {

  listElements(technologies) {
    return(
      <section>
        <h5 style={ style.heading } >Technologies used</h5>
	<ul>
        {technologies.map((tech) => <li key={ btoa(this.props.name + tech.name) } style={ style.technology }>{ tech.name }</li>)}
	</ul>
      </section>
    )
  }

  publicRepos() {
    if(typeof this.props.code == 'string'){
      return(
        <section>
          <h5 style={ style.heading } >Public repos</h5>
          <a key={ btoa(this.props.name + this.props.code) }
            href={this.props.code}
            style={ style.repoLink } >{ this.props.code }</a>
        </section>
      )
    }
  }

  render() {
    return(
      <div style={ style.detail } >
	<h3>
	  <a style={ style.link } href={ this.props.url } target="_blank">{ this.props.name }</a>
	</h3>
        { this.publicRepos() }
        { this.listElements(this.props.technologies) }
      </div>
    )
  }
}

export default Radium(OrganizationProfile)
