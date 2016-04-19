import map from './map'


let handle = document.querySelector("#pullout_handle")

let pulloutMenu = handle.parentElement

let moveFunction = function(e){
  pulloutMenu.style.transform = `translateX(${e.touches[0].pageX - screen.width}px)`
}

handle.addEventListener("touchstart", function(e){
  console.log(e)
  handle.addEventListener('touchmove', moveFunction)
})

handle.addEventListener("touchend", function(e){
  console.log(e)
  handle.removeEventListener('touchmove', moveFunction)
})
