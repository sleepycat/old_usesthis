import React from 'react'
import isMobile from 'ismobilejs'
import OrganizationProfileList from './OrganizationProfileList'
import DrawerHandle from './DrawerHandle'

class Drawer extends React.Component {

  handleHandleMove(e) {
    this.element.style.transform = `translateX(${e.touches[0].pageX - screen.width}px)`
  }

  render() {
    //TODO: some cleaning needs to happen here.
    let baseStyles = {
      height: '100vh',
      borderLeft: '0.3em solid #4682B4',
      fontFamily: 'sans-serif',
      backgroundColor: '#eee',
      margin: 0,
      position: 'absolute',
      display: 'block'
    }

    if(isMobile.any){
      // Mobile styles
      var additional = {
        zIndex: 2,
        right: '-100vw',
        width: '100vw'
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

    return(
      <div ref={ (el) => this.element = el } style={ styles }>
        <DrawerHandle onMove={ ::this.handleHandleMove }  />
        <div id='detail'>
          <OrganizationProfileList profiles={ this.props.contents } />
        </div>
      </div>
    )
  }

}

export default Drawer
