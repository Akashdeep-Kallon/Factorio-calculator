# Factorio calculator (original interface, new calculations)

## Project structure

    index.html          entry point (open it in a browser, no install or build step)
    css/
      styles.css
    js/
      engine.js         calculation engine (also loaded by Node for the tests)
      app.js            interface: i18n, settings, diagram, tables
    data/               generated files, loaded by index.html
      data.js           game data (from data-raw-dump.json)
      icons.js          icon positions inside icons.webp
      icons.webp        icon sheet
      names.es.js       item names, Spanish
      names.ca.js       item names, Catalan
    scripts/            tools that generate everything in data/
      build-data.mjs
      build-icons.py
      build-locale.mjs
    test/
      engine.test.js

Scripts can be run from any directory; they always write into `data/`.
Open `index.html` in a browser. No install or build step.

All game numbers come from Factorio's own data (`data/data.js`, generated from `data-raw-dump.json`):

    factorio --dump-data           # creates script-output/data-raw-dump.json
    npm run data                   # data-raw-dump.json -> data/data.js (2nd argument: FactorioLab data.json for English names)
    python scripts/build-icons.py <icons-factorio>/factorio-icons   # data/icons.webp + data/icons.js from your icons repo   (add FactorioLab's public/data/spa/data.json as 2nd argument to also get icons and English names)
    npm run locale                 # optional: data/names.es.js from your Factorio install
    npm test                       # engine checks against hand-calculated values

What the engine (js/engine.js) takes into account: each recipe's own crafting time and the machine's real speed, fuel type and fuel value
for furnaces and burner drills, electric usage with drain, pollution per machine, modules, beacons, mining productivity, drills and
pumps for raw materials, inserter and belt throughput with how much of each is actually used, oil (basic/advanced, cracking, solid fuel
source) and byproducts through a linear program, and what is unlocked at each research stage.
Not yet: quality, per-recipe overrides, boilers/steam and nuclear power, spoilage, rocket silo, icons for Space Age items.

Icons: built from the icons-factorio repository (Factorio artwork belongs to Wube Software). Item names: Spanish from `data/names.es.js`, otherwise English names from FactorioLab's data.

New in this version: Locations (space platform and the five planets, from the game's surface conditions), a research level that defaults to "Free", fuel dropdowns, every module tier,
machine tiers per recipe (the minimum tier able to make it and how many of each), a production table like FactoryPlanner's, and all rates in the unit you pick (per second or per minute).
Not yet: quality, boilers/steam and nuclear power, per-recipe overrides, importing/exporting plans.

Language: use the selector at the top right (English, Español, Català). Item names come from data/names.es.js / data/names.ca.js (regenerate with npm run locale; equipment names are included now). Catalan interface labels are translated; long help texts still fall back to Spanish.
Item picker: click the current item at the top. Machine counts in the Machines, Resources and Table views are editable: type a number and the whole plan and the amount rescale.
