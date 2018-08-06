CREATE TABLE "customers" (
  "customer_id" SERIAL PRIMARY KEY,
  "customer_email" VARCHAR(50),
  "first_name" VARCHAR(50),
  "last_name" VARCHAR(50),
  "state" VARCHAR(50),
  "city" VARCHAR(50),
  "street" VARCHAR(50),
  "number" INT
);


CREATE TABLE "brands" (
  "brand_id" SERIAL PRIMARY KEY,
  "brand_description" VARCHAR(255),
  "brand_name" VARCHAR(50)
);

CREATE TABLE "products" (
  "product_id" SERIAL PRIMARY KEY,
  "product_name" VARCHAR(50),
  "product_about" VARCHAR(255),
  "product_price" DECIMAL(6,2),
  "warranty" INT,
  "brand_id" INT REFERENCES brands(brand_id)
);

CREATE TABLE "orders" (
  "order_id" SERIAL PRIMARY KEY,
  "product_id" INT REFERENCES products(product_id),
  "customer_id" INT REFERENCES customers(customer_id),
  "purchase_date" DATE
);

CREATE TABLE "customer_fave_products" (
  "fave_products_id" SERIAL PRIMARY KEY,
  "customer_id" INT REFERENCES customers(customer_id),
  "product_id" INT REFERENCES products(product_id)
);

CREATE TABLE "products_category" (
  "products_category_id" SERIAL PRIMARY KEY,
  "product_id" INT REFERENCES products(product_id),
  "category" VARCHAR(50)
);