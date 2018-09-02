import React from 'react'
import OrganizationProfile from './OrganizationProfile'

export default class OrganizationProfileList extends React.Component {
  render() {
    if (this.props.profiles.length == 0) {
      return (
        <p key={btoa('default')} className="explanation">
          Click one of the organizations on the map to see the details.
        </p>
      )
    } else {
      return (
        <div>
          {this.props.profiles.map(org => (
            <OrganizationProfile key={btoa(org.name)} {...org} />
          ))}
        </div>
      )
    }
  }
}
