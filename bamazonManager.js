var inquirer = require("inquirer");
var mysql = require("mysql");

var Table = require('cli-table');

var items = [];

var departments = [];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "Insecure",
  database: "bamazon",

});

connection.connect(function(err) {
  if (err) {
    return console.log(err);
  }

  var query = connection.query(
    "SELECT * FROM products",
    function(err, res) {
      if (err) {
        return console.log(err);
      }
      for (var i=0; i<res.length; i++) {
        items.push(res[i].item_id);
        if (!departments.includes(res[i].department_name)) {
          departments.push(res[i].department_name);
        }
      }
      manager();
    }
  )
});

var manager = function() {
  inquirer.prompt({
    name: "action",
    message: "What would you like to do?",
    type: "list",
    choices: [{name: "View Products for Sale", value: 1},
              {name: "View Low Inventory", value: 2},
              {name: "Add to Inventory", value: 3},
              {name: "Add New Product", value: 4},
              {name: "Quit", value: 5}
             ]
  }).then(function(answer) {
    
    if (answer.action === 1) {
      viewProducts();      
    } else if (answer.action === 2) {
      viewLowInventory();
    } else if(answer.action === 3) {
      addToInventory();
    } else if(answer.action === 4) {
      addNewProduct();
    } else {
      connection.end();
    }
  })
}

var viewProducts = function() {
  connection.query(
    "SELECT * FROM products",
    function(err, results) {
      if (err) {
        return console.log(err);
      }
      var table = new Table({
                      head: ['ID','Product Name', 'Price', "Stock Quantity"],
                      colWidths: [6, 40, 15, 20]
      });
      items = [];
      for (var i=0; i<results.length; i++) {
        items.push(results[i].item_id);
        table.push(
                [results[i].item_id,
                 results[i].product_name, 
                 results[i].price,
                 results[i].stock_quantity]);
      }
      console.log(table.toString());
      manager();
    }
  )
}

var viewLowInventory = function() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, result) {
    var tableLowQuant = new Table({
      head: ['ID','Product Name', 'Price', "Stock Quantity"],
      colWidths: [6, 40, 15, 20]
    });

    for(var i=0; i<result.length; i++) {
      tableLowQuant.push(
              [result[i].item_id,
               result[i].product_name, 
               result[i].price,
               result[i].stock_quantity]);
    }
    console.log(tableLowQuant.toString());
    manager();
  })
}

var addToInventory = function() {
  inquirer.prompt([
    {
      name: "id",
      message: "Which ID would you like to add products to: "
    },
    {
      name: "quantity",
      message: "Quantity: "
    }
  ]).then(function(answer) {
    if (items.includes(parseInt(answer.id))) {
      connection.query("SELECT stock_quantity FROM products WHERE ?", [{item_id: parseInt(answer.id)}], function(err, stock) {
        if (err) {
          return console.log(err)
        }
        var newQuantity = stock[0].stock_quantity + parseInt(answer.quantity);
        connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newQuantity}, { item_id: parseInt(answer.id)}], function(err) {
          if(err) {return console.log(err)}
        })
      })
      console.log("Quantity Added.");
    } else {
      console.log("Item ID does not exist.")
    }
    manager();
  })
}

var addNewProduct = function() {
  inquirer.prompt([
    {
      name:"product_name",
      message: "Product Name: "
    },
    {
      name:"department_name",
      message: "Department Name: ",
      type: "list",
      choices: departments
    },
    {
      name:"price",
      message: "Price: "
    },
    {
      name:"stock_quantity",
      message: "Stock Quantity: ",
    }
  ]).then(function(answer) {
    connection.query(
      "INSERT INTO products SET ?",
      {
        product_name: answer.product_name,
        department_name: answer.department_name,
        price: parseInt(answer.price),
        stock_quantity: parseInt(answer.stock_quantity)
      },
      function(err) {
        if (err) {
          return console.log(err);
        }
        console.log("Product Added.")
        viewProducts();
      }
    )
  })
}