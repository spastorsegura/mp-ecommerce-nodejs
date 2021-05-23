var express = require("express");
var exphbs = require("express-handlebars");
var mercadopago = require("mercadopago");
require("dotenv").config();
var port = process.env.PORT || 3000;

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN,
  integrator_id: process.env.INTEGRATOR_ID,
});

var app = express();

const cliente = {
  name: "Lalo",
  surname: "Landa",
  email: "test_user_46542185@testuser.com",
  phone: {
    number: 5549737300,
    area_code: "52",
  },
  address: {
    zip_code: "03940",
    street_name: "Insurgentes Sur",
    street_number: 1602,
  },
  identification: {
    type: "DNI",
    number: "223344455",
  },
};

const metodos_pago = {
  installments: 6,
  excluded_payment_methods: [
    {
      id: "diners",
    },
  ],
  exclude_payment_types: [
    {
      id: "atm",
    },
  ],
};

const preferencia = {
  items: [],
  back_urls: {
    success: "",
    pending: "",
    failure: "",
  },
  payment_methods: metodos_pago,
  payer: cliente,
  auto_return: "approved",
  notification_url: "",
  external_reference: "sergio_cybert@hotmail.com",
};

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/detail", async function (req, res) {
  console.log(req.query);

  const { img, title, price, unit } = req.query;
  const item = {
    id: "1234",
    title: title,
    description: "Dispositivo móvil de Tienda e-commerce",
    picture_url: img,
    quantity: +unit,
    currency_id: "PEN",
    unit_price: +price,
  };
  preferencia.items.push(item);
  preferencia.back_urls.failure = `${req.get("host")}/failure`;
  preferencia.back_urls.success = `${req.get("host")}/success`;
  preferencia.back_urls.pending = `${req.get("host")}/pending`;
  preferencia.notification_url = `${req.get("host")}/notificaciones`;

  const respuesta = await mercadopago.preferences.create(preferencia);
  console.log(respuesta);
  req.query.init_point = respuesta.body.init_point;
  req.query.id = respuesta.body.id;
  res.render("detail", req.query);
});

app.get("/success", function (req, res) {
  console.log(req.query);
  res.render("success", req.query);
});
app.get("/failure", function (req, res) {
  res.render("failure", req.query);
});
app.get("/pending", function (req, res) {
  res.render("pending", req.query);
});

app.post("/notificaciones", function (req, res) {
  console.log("INICIO DE NOTIFICACIONES");
  console.log("MEDIANTE EL QUERY PARAMS");
  console.log(req.query);
  console.log("MEDIANTE EL BODY");
  console.log(req.body);
  res.status(200);
});

app.listen(port);
