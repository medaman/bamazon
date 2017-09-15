DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (

  item_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  product_name VARCHAR(128) NOT NULL,
  department_name VARCHAR(128) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL

);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Playstation 4", "Gaming", 350, 20),
("Jeans", "Apparel", 50, 100),
("BMW", "Cars", 35000, 10),
("Mac Book", "Computing", 1500, 25),
("XBox One", "Gaming", 299.99, 8),
("Sony 50 Inch LED TV", "Electronics", 1550, 12),
("Chair", "Furniture", 18.50, 20),
("Sofa", "Furniture", 350, 7),
("Table", "Furniture", 100, 9),
("Ferrari", "Car", 100000, 6);
