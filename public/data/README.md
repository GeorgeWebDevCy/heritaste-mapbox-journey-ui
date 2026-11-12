# Land areas

`areas.json` is a generated asset. Do not edit it by hand.

It holds simplified land polygons from Natural Earth's 1:50m countries layer (public domain, https://www.naturalearthdata.com/). It keeps only a numeric `id` per area: no names or codes are shipped or shown. All of Cyprus is merged into a single area, so no line divides the island. The map uses the areas only to keep pins that have to move, either to avoid overlapping or along a route line, on land and inside the same area as their real location.

Regenerate with:

```sh
curl -L -o ne_50m_admin_0_countries.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
npx mapshaper@0.6.102 -i ne_50m_admin_0_countries.geojson -clip bbox=-30,-40,110,72 -each "area = (ADMIN == 'Cyprus' || ADMIN == 'Northern Cyprus' || ADMIN == 'Cyprus No Mans Area') ? 'CYPRUS-ISLAND' : ADM0_A3" -dissolve area -simplify 20% keep-shapes -each 'id=this.id' -filter-fields id -o format=geojson geojson-type=FeatureCollection precision=0.01 areas.json
```

The clip box covers Europe, Africa and Asia as far east as Nepal. Widen it if journeys are added outside that area.
