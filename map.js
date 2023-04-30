var imageryStartDate = '2021-01-01'
var imageryEndDate = '2022-02-24'
var location = ee.Geometry.Point([37.5434, 47.0971]);
Map.setOptions('SATELLITE');

var dateFilter = ee.Filter.date(imageryStartDate, imageryEndDate);


var point1 = [37.40806854671888, 47.03763540121068]; 
var point2 = [37.77130402035169, 47.201170463796686];
var boundingBox = ee.Geometry.Rectangle([point1[0], point1[1], point2[0], point2[1]]);


var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_RT_TOA')
  .filter(dateFilter)
  //.filter(ee.Filter.eq('WRS_PATH', 44))
  //.filter(ee.Filter.eq('WRS_ROW', 34))
  .filterBounds(boundingBox);
  
print('Initial collection size:', collection.size());  
  
// Define a cloud score threshold
var cloudThreshold = 20;

// Define a function to add a cloud score band to an image
var addCloudScore = function(image) {
  var cloudScore = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');
  return image.addBands(cloudScore).set('cloud', cloudScore.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: boundingBox,
    scale: 30
  }).values().get(0));
};


// Map the cloud score function over the collection
var withCloudScores = collection.map(addCloudScore);

print('With cloud scores size:', withCloudScores.size());


// Filter the collection by cloud score
var filteredCollection = withCloudScores.filter(ee.Filter.lt('cloud', cloudThreshold));

print('Filtered collection size:', filteredCollection.size());

// Display the result on the map
Map.addLayer(filteredCollection, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'filtered');
Map.centerObject(location, 7);



function handleMapClick(coords) {
  print('Clicked coordinates:', coords.lon, coords.lat);
  print('Map zoom:', Map.getZoom());
}

Map.onClick(handleMapClick);
