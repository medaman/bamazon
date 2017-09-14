var mysql = require("mysql");
var inquirer = require("inquirer");

var Table = require('cli-table');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "Insecure",
  database: "bamazon",

});

var items = [];
var totalCost = 0;

connection.connect(function(err) {
  if (err) {
    return console.log(err);
  }
  start();
});

var start = function() {
    var query = connection.query(
      "SELECT * FROM products",
      function(err, res) {
        if (err) {
          return console.log(err);
        }
        var table = new Table({
            head: ['ID','Product Name', 'Price'],
            colWidths: [6, 40, 15]
        });

        for(var i=0; i<res.length; i++) {
          items.push(res[i].item_id);
          table.push(
                  [res[i].item_id,
                   res[i].product_name, 
                   res[i].price]);
        }
        console.log(table.toString());
        purchase(res);
      }
    )
}

var purchase = function(res) {
  inquirer.prompt({
    name: "action",
    message: "What would you like to do?",
    type: "list",
    choices: [{name: "Purchase Products", value: 1},
              {name: "Quit", value: 2}]
  }).then(function(answer) {
    if (answer.action === 1) {
      inquirer.prompt([
      {
        name: "id",
        message: "ID of product you would like to buy: "
      },
      {
        name: "quantity",
        message: "Quantity: "
      }
      ]).then(function(answer) {
        if (items.includes(parseInt(answer.id))) {
          connection.query("SELECT stock_quantity FROM products WHERE ?", [{item_id: parseInt(answer.id)}], function(err, stock) {
            var newQuantity = stock[0].stock_quantity - answer.quantity;
            if (newQuantity < 0) {
              console.log("Insufficient Quantity");
              purchase(res);
            } else {
                connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newQuantity}, { item_id: parseInt(answer.id)}], function(err) {
                  if(err) {return console.log(err)}
                })
              connection.query("SELECT price FROM products WHERE ?", [{item_id: answer.id}], function (err, productPrice) {
                if (err) {return console.log(err)}
                totalCost += productPrice[0].price * parseInt(answer.quantity);
                console.log("Product Purchased. Total Cost of purchases: " + totalCost);
              })
              start();
            }
          })
        } else {
          console.log("Item ID does not exist.")
          start();
        }
      })
    } else {
      connection.end();
    }
  })
}