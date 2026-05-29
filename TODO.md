# TODO

- [x] Migration created: `product_size_inventory`.
- [x] Update Admin product form to manage per-size stock + per-size soldout.

- [x] On save, upsert rows into `product_size_inventory` for each size.

- [x] Derive and store global `products.is_sold_out` based on inventory (preference chosen: derive on admin save).

- [x] Update storefront hooks/queries to join `product_size_inventory` so sold-out logic is per selected size.

- [ ] Update `ProductCard` + `ProductPage` UI/logic to:

  - show SOLD OUT if all sizes sold out
  - disable Add to Cart if selected size is sold out
  - optionally disable sold-out size buttons
- [ ] Run typecheck/build and do a quick manual verification in dev server.

