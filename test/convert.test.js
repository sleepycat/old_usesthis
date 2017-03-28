
import Convert from '../public/javascripts/convert'

describe('Convert', () => {

  it('is has a toGeojson method', () => {
    expect(Convert.toGeojson).toBeTruthy()
  })

  describe('.toGeojson', () => {

    let location = {
      "address": "165 Rue Wellington, Gatineau, QC J8X 2J3, Canada",
      "lat": 45.4263103,
      "lng": -75.71736659999999,
      "organizations": [
        {
          "name": "Macadamian",
          "technologies": [
            {
              "name": "c++"
            },
            {
              "name": "objective-c"
            }
          ]
        }
      ]
    };

   it('accepts an object and returns geojson', (done) => {
     let results = Convert.toGeojson([location])
     expect(results.features[0].geometry.coordinates).toEqual([-75.71736659999999, 45.4263103])
     done()
   })

  })

})

