import React from 'react'
import isMobile from 'ismobilejs'
import OrganizationProfileList from './OrganizationProfileList'
import DrawerHandle from './DrawerHandle'

class Drawer extends React.Component {
  state = {
    x: 0,
    highlight: false,
    previousContentName: '',
  }

  handleHandleMove(e) {
    let x = e.touches[0].pageX
    if (x > 0 && x < window.screen.width) {
      this.setState({ x: x - window.screen.width })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.contents.length > 0) {
      if (nextProps.contents[0].name !== this.state.previousContentName) {
        this.setState(
          { highlight: true, previousContentName: nextProps.contents[0].name },
          () => {
            setTimeout(() => {
              this.setState({ highlight: false })
            }, 300)
          },
        )
      }
    }
  }

  render() {
    let baseStyles = {
      height: '100vh',
      borderLeft: '0.3em solid #4682B4',
      fontFamily: 'sans-serif',
      backgroundColor: '#eee',
      margin: 0,
      position: 'absolute',
      display: 'block',
      transform: `translateX(${this.state.x}px)`,
    }

    if (isMobile.any) {
      // Mobile styles
      var additional = {
        zIndex: 2,
        right: '-100vw',
        width: '100vw',
      }
    } else {
      // Desktop styles
      var additional = {
        right: 0,
        margin: 0,
        overflow: 'auto',
        width: '20vw',
        zIndex: 1,
        WebkitTransform: 'none',
        MozTransform: 'none',
        msTransform: 'none',
        transform: 'none',
      }
    }

    let styles = Object.assign({}, baseStyles, additional)

    return (
      <div ref={el => (this.element = el)} style={styles}>
        <DrawerHandle
          highlight={this.state.highlight}
          ref={el => (this.handle = el)}
          onMove={::this.handleHandleMove}
        />
        <div id="detail">
          <OrganizationProfileList profiles={this.props.contents} />
        </div>
      </div>
    )
  }
}

export default Drawer
