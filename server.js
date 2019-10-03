let express = require("express")
let mongodb = require("mongodb")
let sanitizeHTML = require("sanitize-html")

let app = express()
let db

let port = process.env.PORT

if (port == null || port == "") {
  port = 3000
}

let connectionString = "mongodb+srv://kakashi:Aldyhudv2TAbKIH9@cluster0-bm0ux.mongodb.net/kakashi?retryWrites=true&w=majority"
mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
  db = client.db()
  app.listen(port)
})

app.use(express.static("public"))

app.use(express.json())
app.use(express.urlencoded({extended: false}))

function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", "Basic realm='Midify'")
  if (req.headers.authorization == "Basic a2FrYXNoaTprYWthc2hpQHNlbnNlaQ==" || req.headers.authorization == "Basic YWRtaW46YWRtaW4=") {
    next()
  } else {
    res.status(401).send("authorized personal only!!")
  }
}

app.use(passwordProtected)

app.get("/", function(req, res) {
  db.collection("items").find().toArray(function(err, items) {
    res.send(
        `<!DOCTYPE html>
        <html lang="en" dir="ltr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Midify - Your personalized todo app!!</title>
            <style>
              body{background-color: #1a1a1d !important;}.text-div{margin-top:20px}.form-div{margin-top:30px;margin-bottom:50px}.form-control:focus{outline:0!important;border:none!important;box-shadow:none!important}.list-here{background-color: #4e4e50 !important;}.list-group-item{border: solid 1px #c3073f !important;}button{background-color:#190061!important;border:none!important}.edit-me{color:#fee140!important}.delete-me,.insert-me{color:#fa709a!important}.item-text{color:#e7eae5;text-transform:capitalize;font-size:18px;text-shadow:2px 2px 20px}h1{color:#c3073f!important;text-shadow:2px 2px 4px}p{color: #950740 !important;text-shadow:0 0 3px red,0 0 5px}.blinking{animation:blinkingText .8s infinite}@keyframes blinkingText{0%{opacity:1}49%{opacity:.6}50%{opacity:.7}99%{opacity:.9}100%{opacity:1}}
            </style>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
          </head>
          <body>
            <div class="container">
              <div class="text-center text-div">
                <h1>Midify</h1>
                <p class="lead blinking">Your personalized todo app!!</p>
              </div>
              <div class="form-div">
                <form id="form-field" action="/create-item" method="POST">
                  <div class="d-flex align-items-center">
                    <input id="item-field" name="item" autofocus autocomplete="off" class="form-control mr-3 shadow" type="text" style="flex: 1;">
                    <button class="btn btn-primary insert-me shadow">Add New Item</button>
                  </div>
                </form>
              </div>
              <ul id="list-field" class="list-group">
              </ul>
            </div>

          <script>
            let items = ${JSON.stringify(items)}
          </script>
          <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
          <script src="/browser.js"></script>
          </body>
        </html>`
    )
  })

})

app.post("/create-item", function(req, res) {
  safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection("items").insertOne({text: safeText}, function(err, info) {
    res.json(info.ops[0])
  })
})

app.post("/update-item", function(req, res) {
  safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection("items").findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)} ,{$set: {text: safeText}}, function() {
    res.send("Success!!")
  })
})

app.post("/delete-item", function(req, res) {
  db.collection("items").deleteOne({_id: new mongodb.ObjectId(req.body.id)}, function() {
    res.send("Success!!")
  })
})
