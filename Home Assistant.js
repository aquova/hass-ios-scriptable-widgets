// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: home;
let widget = await createWidget()
Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  let background_color = new Color("#03a9f4", 1.0)
  let widget = new ListWidget()
  widget.backgroundColor = background_color
  widget.url = "homeassistant://"

  let req = new Request("http://hass.example.com/api/states")
  req.headers = {
    "Authorization": "Bearer <LONG TERM TOKEN>",
    "content-type": "application/json"
  }

  var json
  try {
  	json = await req.loadJSON()
	} catch (error) {
	  let errorStack = addText(widget, "Unavailable")
    return widget
  }

  let outside_temp = getState(json, "sensor.temperature")
  let outside_humidity = getState(json, "sensor.humidity")
  let outside_wind_spd = getState(json, "sensor.wind_speed")

  let headerStack = widget.addStack()
  let logoStack = headerStack.addStack()
  headerStack.addSpacer(2)
  let titleStack = headerStack.addStack()

  let logoImg = await getLogo()
  logoStack.backgroundColor = background_color
  logoStack.cornerRadius = 2
  let logo = logoStack.addImage(logoImg)
  logo.imageSize = new Size(50, 50)
  logo.rightAlignImage()

  let titleText = titleStack.addText("Home Assistant")
  titleStack.setPadding(10, 10, 0, 0)
  titleText.font = Font.heavyMonospacedSystemFont(12)
  titleText.textColor = Color.white()

  let bodyStack = widget.addStack()
  bodyStack.layoutVertically()

	let tempStack = addText(bodyStack, "Temp: " + outside_temp + "ºF")
  let humidStack = addText(bodyStack, "Humidity: " + outside_humidity + "%")
  let speedStack = addText(bodyStack, "Wind Spd: " + outside_wind_spd + " mph")

  return widget
}

function getState(json, sensor) {
  for (i = 0; i < json.length; i++) {
    if (json[i]["entity_id"] == sensor) {
      return json[i]["state"]
    }
  }
  return null
}

function addText(parent, text) {
  let newStack = parent.addStack()

  newStack.centerAlignContent()
  newStack.setPadding(5, 5, 0, 0)
  let label = newStack.addText(text)
  label.font = Font.heavyMonospacedSystemFont(12)
  label.textColor = Color.black()

  return newStack
}

async function getLogo() {
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "logo.png")
  if (fm.fileExists(path)) {
    return fm.readImage(path)
  } else {
    let imageUrl = "https://raw.githubusercontent.com/home-assistant/frontend/dev/public/static/icons/favicon-192x192.png"
    let req = new Request(imageUrl)
    let loadedImage = await req.loadImage()
    fm.writeImage(path, loadedImage)
    return loadedImage
  }
}
