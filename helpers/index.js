const request = require("request");
const GPX = require("./gpx");
const gpx = new GPX();
console.log("Please wait ....\n");
request.get(
  "https://dl.dropboxusercontent.com/s/8nvqnasci6l76nz/Problem.gpx",
  {},
  (err, d) => {
    console.log("data fetching complete.\nProcessing the data...\n");
    gpx.parse(d.body);
    const total_distance =
      Math.round((gpx.tracks[0].distance.total / 1000) * 100) / 100;
    const elevation = {
      min: Math.floor(gpx.tracks[0].elevation.min),
      max: Math.floor(gpx.tracks[0].elevation.max),
      avg: Math.floor(gpx.tracks[0].elevation.avg)
    };
    const speed = {
      max: Math.floor(gpx.tracks[0].speed.max),
      avg: Math.floor(gpx.tracks[0].speed.avg)
    };
    const time = Math.floor(gpx.tracks[0].time.totalMoving / 3.6e6);

    console.log(
      "Total Distance: " +
        total_distance +
        " KM \n" +
        "Elevation Min: " +
        elevation.min +
        " M\n" +
        "Elevation Max: " +
        elevation.max +
        " M\n" +
        "Elevation Avg: " +
        elevation.avg +
        " M\n" +
        "Speed Max: " +
        speed.max +
        " KM/h\n" +
        "Speed Avg: " +
        speed.avg +
        " KM/h\n" +
        "Moving Time: ~" +
        time +
        " Hours"
    );
    process.exit(0);
  }
);
