-- Create a function for accent-insensitive search
create or replace function search_products(search_term text)
returns setof products as $$
  select *
  from products
  where 
    unaccent(lower(name)) ilike unaccent(lower(search_term))
    or unaccent(lower(description)) ilike unaccent(lower(search_term))
  limit 10;
$$ language sql stable;
