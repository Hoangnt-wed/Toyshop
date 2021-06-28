const express = require('express');
const engines = require('consolidate');
const app = express();

var bodyParser = require("body-parser");
const { parse } = require('path');
app.use(bodyParser.urlencoded({ extended: false }));

var public = require('path').join(__dirname, '/public');
app.use(express.static('public'));

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://hoangnt:hoangnt1234@cluster0.gzlfl.mongodb.net/test";

app.get('/', async (req, res) => {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const dbo = client.db("ToyShop");
    const results = await dbo.collection("products").find({}).toArray();
    res.render('index', { model: results });
})

app.get('/allProduct', async (req, res) => {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const dbo = client.db("ToyShop");
    const results = await dbo.collection("products").find({}).toArray();
    res.render('allProduct', { model: results });
})

app.get('/delete', async (req, res) => {
    const inputId = req.query.id;
    const client = await MongoClient.connect(url);
    const dbo = client.db("ToyShop");
    var ObjectID = require('mongodb').ObjectID;
    const condition = { "_id": ObjectID(inputId) };
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/allProduct');
})

app.get('/insert', (req, res) => {
    res.render('insert');
})

app.post('/doInsert', async (req, res) => {
    const inputName = req.body.txtName;
    const inputMSP = req.body.txtMSP;
    const inputSL = req.body.txtSL;
    const inputPrice = req.body.txtPrice;
    // NaN: Not a number
    // isNaN(value); neu no la so tra false , true;
    const newProduct = { name: inputName, MSP: inputMSP, Sl: inputSL, Price: inputPrice };
    if (inputName.length == 0 || inputSL <= 0) {
        const modelError = { SlError: "so luong < 1 de nghi nhap them so luong san pham!", nameError: "error name!", mspError: "error msp!" };
        res.render('insert', { model: modelError });
    }
    else {
        const client = await MongoClient.connect(url);
        const dbo = client.db("ToyShop");
        await dbo.collection("products").insertOne(newProduct);
        res.redirect('/allProduct');
    }
})

app.post('/doSearch', async (req, res) => {
    const inputName = req.body.txtName;
    const client = await MongoClient.connect(url);
    const dbo = client.db("ToyShop");
    const results = await dbo.collection("products").find({ name: new RegExp(inputName, 'i') }).toArray();
    res.render('allProduct', { model: results });
})

app.get('/update', async function (req, res) {
    const id = req.query.id;
    console.log(id)
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const dbo = client.db("ToyShop");
    var ObjectID = require('mongodb').ObjectID;
    const condition = { "_id": ObjectID(id) };
    const results = await dbo.collection("products").find(condition).toArray();
    res.render('update', { model: results });
})

app.post('/doupdate', async (req, res) => {
    const id = req.body.id;
    var ObjectID = require('mongodb').ObjectID;
    const condition = { "_id": ObjectID(id) };
    console.log(condition)
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const dbo = client.db("ToyShop");
    change = {
        $set: {
            name: req.body.txtName,
            MSP: req.body.txtMSP,
            Sl: req.body.txtSL,
            Price: req.body.txtPrice
        }
    }
    await dbo.collection("products").updateOne(condition, change);
    res.redirect('/allProduct');
})

server = app.listen(process.env.PORT || 5000, (err) => {
    if (err) { console.log(err) } else {
        console.log('thanh cong');
    }
});