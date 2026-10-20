/* ---------- helpers ---------- */
const pretty = id => { const s = id.replace(/-/g, " "); return s[0].toUpperCase() + s.slice(1) };
const $ = s => document.querySelector(s);
const LANGS = { en: "English", es: "Español", ca: "Català" };
const LANG = (() => { let v = ""; try { v = localStorage.getItem("frc-lang") || "" } catch (_) { } if (LANGS[v]) return v; const n = String((navigator.languages && navigator.languages[0]) || navigator.language || "en").toLowerCase(); return n.startsWith("es") ? "es" : n.startsWith("ca") ? "ca" : "en" })();

const T = {
    en: {
        "title": "Factorio reverse calculator",
        "subtitle": "Choose what to make and how much: I'll tell you the resources, machines and belts.",
        "change.aria": "Change item", "change": "Change ›", "amount": "Amount", "unit": "Unit", "per.s": "per second", "per.m": "per minute",
        "phase": "Stage & speeds", "preset.start": "Early", "preset.mid": "Mid", "preset.late": "Late",
        "grp.asm": "Assemblers", "grp.fur": "Furnaces", "grp.min": "Mining drills", "grp.belt": "Belts", "grp.ins": "Inserters", "grp.stk": "Inserter capacity", "grp.src": "Inserters pick from", "tt.asm": "Assemblers are the machines that build most things: gears, circuits, science packs...|The better the assembler, the faster it builds, so you need fewer of them. A worse one means the result asks for more machines.|Pick the one you have unlocked. Just started? Asm. 1.",
        "tt.fur": "Furnaces melt ore into plates (iron, copper, steel, bricks).|Stone furnaces are slow; steel and electric ones are twice as fast, so you need half as many.|Pick the type you are using right now.",
        "tt.min": "Mining drills dig ore out of the ground.|A better drill digs more ore per second, so you need fewer to supply your factory.|Pick the drill you have.",
        "tt.belt": "Belts carry items from one place to another.|This does not change how many machines you need. It only changes how many belts the result tells you to build: a faster belt carries more, so you need fewer.|Pick the color you have unlocked.",
        "tt.ins": "Inserters are the little arms that put items into machines and take them out.|If they are too slow, machines sit waiting for ingredients. A faster inserter means fewer inserters per machine.|Pick the one you have unlocked.",
        "tt.stk": "How many items an inserter carries per trip. It improves when you finish the research 'Inserter capacity bonus'.|More items per trip means each inserter does more work, so fewer inserters are needed.|Check your research list: +0 if you have none, +2 or +7 depending on the level you finished.",
        "tt.src": "Where the inserters pick items up: from a chest, or straight from a belt.|Picking from a belt is slower, so more inserters are needed.|Belt if your machines are fed by belts (most factories), Chest if you use chests.",
        "tt.mt": "Modules are upgrades you put inside machines.|Speed: the machine works faster, so you need fewer machines. Productivity: you get extra items for free, so you need less raw material, but the machine is slower.|Don't have modules yet? Leave it on None.",
        "tt.ml": "Modules come in three levels: T1 is the weakest and T3 the strongest.|A higher level gives a bigger bonus.|Pick the best level you can build.",
        "tt.bn": "Beacons are buildings that give extra speed to the machines around them.|More beacons make machines faster, so you need fewer. Each extra beacon helps a bit less than the last.|If you don't use beacons, leave 0.",
        "tt.bl": "Beacons hold speed modules, which come in levels T1 to T3.|A higher level makes the beacons stronger.|Pick the best level you have.",
        "tt.sf": "Solid fuel can be made from three different liquids: light oil, petroleum gas or heavy oil.|Your choice decides which liquid the result counts as needed.|Pick the liquid you have the most of.",
        "to.mt.n": "No modules. Machines work at normal speed.", "to.mt.s": "Speed modules in every machine slot: machines work faster, so you need fewer. They use more energy.", "to.mt.p": "Productivity modules in every machine slot: extra items for free, but machines work slower. It doesn't apply to final items like machines or belts.",
        "to.src.c": "Inserters take items from a chest. This is the fastest.", "to.src.b": "Inserters take items from a belt. It is slower, so more inserters are needed.",
        "to.stk.0": "No inserter capacity research: each trip carries 1 item.", "to.stk.2": "You finished 'Inserter capacity bonus' up to level 2: more items per trip.", "to.stk.7": "You finished 'Inserter capacity bonus' up to the last level (7): many more items per trip.", "to.stk.s": "You also researched belt stacking: inserters can put several items per belt slot.",
        "to.sf.l": "Each solid fuel uses 10 light oil.", "to.sf.g": "Each solid fuel uses 20 petroleum gas.", "to.sf.h": "Each solid fuel uses 20 heavy oil.", "cfg.hint": "Easiest: pick Early, Mid or Late above. Everything below is optional and only shows what this item needs.",
        "h.asm": "Machine that crafts most items. Higher number = faster, so you need fewer.", "h.fur": "Smelts ores into plates. Steel and electric are faster than stone.", "h.min": "Mines ore. Better drills mean you need fewer.", "h.belt": "Belt tier you use. It only changes how many belts are needed.", "h.ins": "Arms that move items in and out of machines. Better ones mean fewer are needed.",
        "h.stk": "The 'Inserter capacity bonus' research you finished. Not sure? +0 early, +2 mid, +7 late.", "h.src": "Where inserters take items from: a chest, or straight from a belt (a bit slower).",
        "h.mt": "Upgrades placed inside machines. Speed: crafts faster. Productivity: free extra items but slower. Leave None if you don't use modules.", "h.ml": "Module level: T3 is the strongest.", "h.bn": "Beacons give nearby machines extra speed. Use 0 if you don't build them.", "h.bl": "Level of the speed modules inside the beacons.", "h.sf": "Solid fuel can be made from 3 different oils. Pick the one you have.", "grp.mt": "Machine modules", "grp.ml": "Module tier", "grp.bn": "Beacons", "grp.bl": "Beacon speed tier", "grp.sf": "Solid fuel recipe", "sp.chest": "Chest", "sp.cs": "Belt stacking", "sp.belt": "Belt → chest", "sp.mn": "None", "sp.ms": "Speed", "sp.mp": "Productivity", "sp.sfl": "Light oil", "sp.sfg": "Pet. gas", "sp.sfh": "Heavy oil",
        "sp.a1": "Asm. 1", "sp.a2": "Asm. 2", "sp.a3": "Asm. 3", "sp.stone": "Stone", "sp.steel": "Steel", "sp.elec": "Electric", "sp.burner": "Burner", "sp.big": "Big",
        "sp.y": "Yellow", "sp.r": "Red", "sp.b": "Blue", "sp.t": "Turbo",
        "sp.ibur": "Burner", "sp.ibas": "Basic", "sp.ilon": "Long", "sp.ifas": "Fast", "sp.ibul": "Bulk",
        "pick.aria": "Choose item", "pick.title": "Choose what to produce", "close": "Close", "search.ph": "Search item…", "search.aria": "Search item", "none": "No results",
        "cat.all": "All", "cat.I": "Intermediates", "cat.P": "Production", "cat.L": "Logistics", "cat.C": "Combat",
        "view.diag": "Diagram", "view.steps": "Machines", "view.raw": "Resources",
        "zoom.out": "Zoom out", "zoom.in": "Zoom in", "zoom.fit": "Fit", "fs.enter": "Full screen", "fs.exit": "Exit full screen",
        "note": "Drag to move, scroll wheel or pinch to zoom. Line thickness is proportional to flow (items/s). Click an item to calculate only that sub-chain. Fluids are in units/s and need pipes, not belts.",
        "steps.title": "Intermediate steps and machines", "ins.note": "Inserters per machine, one set per solid ingredient plus the output. Speeds come from the wiki tables (normal quality, Factorio 2.0 measurements): chest to chest, or belt to chest for the selected belt. Outputs always use chest to chest. Fluids use pipes, not inserters.", "ins.per": "per machine", "ins.in": "in", "ins.out": "out", "ins.tip": "Per machine: {0} inserters in, {1} out (limit {2}/s each)", "ins.total": "inserters", "raw.title": "Base resources", "base": "This item is a base resource.",
        "sum.prod": "output", "sum.asm": "assemblers", "sum.fur": "furnaces", "sum.chem": "chemical plants", "sum.drill": "mining drills", "sum.ins": "inserters",
        "exact": "exact", "items.s": "items/s", "belts": "belts", "drills": "mining drills", "resource": "resource",
        "u.a": "asm.", "u.f": "furnaces", "u.c": "plants",
        "back": "← Back", "hint": "Click an item in the diagram to calculate only that sub-chain, at the rate {0} needs.",
        "diag.aria": "Production chain diagram", "node.tip": "Click to calculate only {0} ({1}/s)"
    },
    es: {
        "title": "Calculadora inversa de Factorio",
        "subtitle": "Elige qué fabricar y cuánto: te digo recursos, máquinas y cintas.",
        "change.aria": "Cambiar ítem", "change": "Cambiar ›", "amount": "Cantidad", "unit": "Unidad", "per.s": "por segundo", "per.m": "por minuto",
        "phase": "Fase y velocidades", "preset.start": "Inicio", "preset.mid": "Medio", "preset.late": "Avanzado",
        "grp.asm": "Ensambladoras", "grp.fur": "Hornos", "grp.min": "Perforadoras", "grp.belt": "Cintas", "grp.ins": "Insertadores", "grp.stk": "Capacidad de insertadores", "grp.src": "Los insertadores cogen de", "tt.asm": "Las ensambladoras son las máquinas que construyen casi todo: engranajes, circuitos, paquetes de ciencia...|Cuanto mejor la ensambladora, más rápido construye y menos necesitas. Con una peor, el resultado pide más máquinas.|Elige la que tengas desbloqueada. ¿Acabas de empezar? Asm. 1.",
        "tt.fur": "Los hornos funden el mineral en placas (hierro, cobre, acero, ladrillos).|Los de piedra son lentos; los de acero y eléctricos son el doble de rápidos, así que necesitas la mitad.|Elige el tipo que uses ahora.",
        "tt.min": "Las perforadoras sacan mineral del suelo.|Una mejor saca más mineral por segundo, así que necesitas menos para abastecer tu fábrica.|Elige la perforadora que tengas.",
        "tt.belt": "Las cintas llevan ítems de un sitio a otro.|No cambia cuántas máquinas necesitas. Solo cambia cuántas cintas te dice que construyas: una cinta más rápida lleva más, así que hacen falta menos.|Elige el color que tengas desbloqueado.",
        "tt.ins": "Los insertadores son los brazos que meten ítems en las máquinas y los sacan.|Si son muy lentos, las máquinas se quedan esperando ingredientes. Un insertador más rápido significa menos insertadores por máquina.|Elige el que tengas desbloqueado.",
        "tt.stk": "Cuántos ítems lleva un insertador en cada viaje. Mejora al terminar la investigación 'Bonus de capacidad de insertadores'.|Más ítems por viaje significa que cada insertador trabaja más, así que hacen falta menos.|Mira tu lista de investigaciones: +0 si no tienes ninguna, +2 o +7 según el nivel que hayas terminado.",
        "tt.src": "De dónde recogen los insertadores los ítems: de un cofre o directamente de una cinta.|Coger de una cinta es más lento, así que hacen falta más insertadores.|Cinta si tus máquinas se alimentan con cintas (la mayoría de fábricas), Cofre si usas cofres.",
        "tt.mt": "Los módulos son mejoras que pones dentro de las máquinas.|Velocidad: la máquina trabaja más rápido, así que necesitas menos máquinas. Productividad: sacas ítems extra gratis, así que gastas menos materia prima, pero la máquina va más lenta.|¿Aún no tienes módulos? Déjalo en Ninguno.",
        "tt.ml": "Los módulos tienen tres niveles: T1 es el más débil y T3 el más potente.|Un nivel más alto da un bonus mayor.|Elige el mejor nivel que puedas fabricar.",
        "tt.bn": "Las balizas son edificios que dan velocidad extra a las máquinas que tienen alrededor.|Más balizas hacen las máquinas más rápidas, así que necesitas menos. Cada baliza extra ayuda un poco menos que la anterior.|Si no usas balizas, deja 0.",
        "tt.bl": "Las balizas llevan módulos de velocidad, que tienen niveles de T1 a T3.|Un nivel más alto hace las balizas más potentes.|Elige el mejor nivel que tengas.",
        "tt.sf": "El combustible sólido se puede hacer con tres líquidos distintos: aceite ligero, gas de petróleo o aceite pesado.|Tu elección decide qué líquido cuenta el resultado como necesario.|Elige el líquido del que tengas más.",
        "to.mt.n": "Sin módulos. Las máquinas trabajan a velocidad normal.", "to.mt.s": "Módulos de velocidad en cada hueco de la máquina: trabajan más rápido, así que necesitas menos. Gastan más energía.", "to.mt.p": "Módulos de productividad en cada hueco de la máquina: ítems extra gratis, pero las máquinas van más lentas. No sirve para ítems finales como máquinas o cintas.",
        "to.src.c": "Los insertadores cogen los ítems de un cofre. Es lo más rápido.", "to.src.b": "Los insertadores cogen los ítems de una cinta. Es más lento, así que hacen falta más.",
        "to.stk.0": "Sin investigación de capacidad: cada viaje lleva 1 ítem.", "to.stk.2": "Has terminado 'Bonus de capacidad de insertadores' hasta el nivel 2: más ítems por viaje.", "to.stk.7": "Has terminado 'Bonus de capacidad de insertadores' hasta el último nivel (7): muchos más ítems por viaje.", "to.stk.s": "También has investigado el apilado en cinta: los insertadores pueden poner varios ítems por hueco de cinta.",
        "to.sf.l": "Cada combustible sólido usa 10 de aceite ligero.", "to.sf.g": "Cada combustible sólido usa 20 de gas de petróleo.", "to.sf.h": "Cada combustible sólido usa 20 de aceite pesado.", "cfg.hint": "Lo más fácil: elige Inicio, Medio o Avanzado arriba. Lo de abajo es opcional y solo muestra lo que necesita este ítem.",
        "h.asm": "Máquina que fabrica casi todo. Más número = más rápida, así que necesitas menos.", "h.fur": "Funde minerales en placas. Acero y eléctrico son más rápidos que piedra.", "h.min": "Extrae mineral. Mejores perforadoras = necesitas menos.", "h.belt": "Tipo de cinta que usas. Solo cambia cuántas cintas hacen falta.", "h.ins": "Brazos que mueven ítems dentro y fuera de las máquinas. Mejores = hacen falta menos.",
        "h.stk": "La investigación 'Bonus de capacidad de insertadores' que hayas terminado. ¿No sabes? +0 al inicio, +2 a mitad, +7 al final.", "h.src": "De dónde cogen los insertadores: de un cofre o directo de una cinta (algo más lento).",
        "h.mt": "Mejoras dentro de las máquinas. Velocidad: fabrican más rápido. Productividad: sacan ítems extra gratis pero van más lentas. Deja Ninguno si no usas módulos.", "h.ml": "Nivel del módulo: T3 es el más potente.", "h.bn": "Las balizas dan velocidad extra a máquinas cercanas. Pon 0 si no las construyes.", "h.bl": "Nivel de los módulos de velocidad dentro de las balizas.", "h.sf": "El combustible sólido se hace con 3 líquidos distintos. Elige el que tengas.", "grp.mt": "Módulos en máquinas", "grp.ml": "Nivel de módulo", "grp.bn": "Balizas", "grp.bl": "Nivel velocidad baliza", "grp.sf": "Receta de combustible sólido", "sp.chest": "Cofre", "sp.cs": "Apilado en cinta", "sp.belt": "Cinta → cofre", "sp.mn": "Ninguno", "sp.ms": "Velocidad", "sp.mp": "Productividad", "sp.sfl": "Aceite ligero", "sp.sfg": "Gas", "sp.sfh": "Aceite pesado",
        "sp.a1": "Asm. 1", "sp.a2": "Asm. 2", "sp.a3": "Asm. 3", "sp.stone": "Piedra", "sp.steel": "Acero", "sp.elec": "Eléctrico", "sp.burner": "Quemador", "sp.big": "Grande",
        "sp.y": "Amarilla", "sp.r": "Roja", "sp.b": "Azul", "sp.t": "Turbo",
        "sp.ibur": "Combustión", "sp.ibas": "Básico", "sp.ilon": "Largo", "sp.ifas": "Rápido", "sp.ibul": "Volumen",
        "pick.aria": "Elegir ítem", "pick.title": "Elige qué producir", "close": "Cerrar", "search.ph": "Buscar ítem…", "search.aria": "Buscar ítem", "none": "Sin resultados",
        "cat.all": "Todo", "cat.I": "Intermedios", "cat.P": "Producción", "cat.L": "Logística", "cat.C": "Combate",
        "view.diag": "Diagrama", "view.steps": "Máquinas", "view.raw": "Recursos",
        "zoom.out": "Alejar", "zoom.in": "Acercar", "zoom.fit": "Ajustar", "fs.enter": "Pantalla completa", "fs.exit": "Salir de pantalla completa",
        "note": "Arrastra para moverte, rueda o pellizco para hacer zoom. El grosor de cada línea es proporcional al flujo (ítems/s). Pulsa un ítem para calcular solo esa sub-cadena. Los fluidos van en unidades/s y necesitan tuberías, no cintas.",
        "steps.title": "Pasos intermedios y máquinas", "ins.note": "Insertadores por máquina: un grupo por ingrediente sólido más la salida. Las velocidades salen de las tablas de la wiki (calidad normal, mediciones de Factorio 2.0): cofre a cofre, o cinta a cofre según la cinta elegida. La salida usa siempre cofre a cofre. Los fluidos usan tuberías, no insertadores.", "ins.per": "por máquina", "ins.in": "entrada", "ins.out": "salida", "ins.tip": "Por máquina: {0} insertadores de entrada, {1} de salida (límite {2}/s cada uno)", "ins.total": "insertadores", "raw.title": "Recursos base", "base": "Este ítem es un recurso base.",
        "sum.prod": "producción", "sum.asm": "ensambladoras", "sum.fur": "hornos", "sum.chem": "plantas químicas", "sum.drill": "perforadoras", "sum.ins": "insertadores",
        "exact": "exactas", "items.s": "ítems/s", "belts": "cintas", "drills": "perforadoras", "resource": "recurso",
        "u.a": "ensambl.", "u.f": "hornos", "u.c": "plantas",
        "back": "← Volver", "hint": "Pulsa un ítem del diagrama para calcular solo esa sub-cadena, al ritmo que necesita {0}.",
        "diag.aria": "Diagrama de la cadena de producción", "node.tip": "Pulsa para calcular solo {0} ({1}/s)"
    }
};
/* Spanish item names (icons and recipes stay keyed by the English name) */
const ES = {
    "Advanced circuit": "Circuito avanzado", "Automation science pack": "Paquete de ciencia de automatización", "Logistic science pack": "Paquete de ciencia logística", "Chemical science pack": "Paquete de ciencia química", "Military science pack": "Paquete de ciencia militar", "Production science pack": "Paquete de ciencia de producción", "Utility science pack": "Paquete de ciencia de utilidad",
    "Battery": "Batería", "Copper cable": "Cable de cobre", "Copper plate": "Placa de cobre", "Iron plate": "Placa de hierro", "Steel plate": "Placa de acero", "Stone brick": "Ladrillo de piedra",
    "Electric engine unit": "Motor eléctrico", "Electronic circuit": "Circuito electrónico", "Engine unit": "Motor", "Explosives": "Explosivos", "Flying robot frame": "Armazón de robot volador", "Iron gear wheel": "Engranaje de hierro", "Iron stick": "Varilla de hierro",
    "Low density structure": "Estructura de baja densidad", "Lubricant": "Lubricante", "Plastic bar": "Barra de plástico", "Processing unit": "Unidad de procesamiento", "Rocket fuel": "Combustible de cohete", "Sulfur": "Azufre", "Sulfuric acid": "Ácido sulfúrico",
    "Accumulator": "Acumulador", "Assembling machine 1": "Máquina ensambladora 1", "Assembling machine 2": "Máquina ensambladora 2", "Assembling machine 3": "Máquina ensambladora 3", "Beacon": "Baliza", "Boiler": "Caldera",
    "Burner mining drill": "Perforadora minera de combustión", "Chemical plant": "Planta química",
    "Efficiency module": "Módulo de eficiencia", "Productivity module": "Módulo de productividad", "Quality module": "Módulo de calidad", "Speed module": "Módulo de velocidad",
    "Electric furnace": "Horno eléctrico", "Steel furnace": "Horno de acero", "Stone furnace": "Horno de piedra", "Electric mining drill": "Perforadora minera eléctrica", "Big mining drill": "Perforadora minera grande",
    "Lab": "Laboratorio", "Offshore pump": "Bomba de agua", "Oil refinery": "Refinería de petróleo", "Pumpjack": "Extractor de petróleo", "Repair pack": "Kit de reparación", "Solar panel": "Panel solar", "Steam engine": "Máquina de vapor",
    "Burner inserter": "Insertador de combustión", "Inserter": "Insertador", "Fast inserter": "Insertador rápido", "Long-handed inserter": "Insertador de brazo largo", "Bulk inserter": "Insertador de volumen",
    "Transport belt": "Cinta transportadora", "Fast transport belt": "Cinta transportadora rápida", "Express transport belt": "Cinta transportadora exprés", "Turbo transport belt": "Cinta transportadora turbo", "Underground belt": "Cinta subterránea", "Splitter": "Divisor",
    "Pipe": "Tubería", "Pipe to ground": "Tubería subterránea", "Iron chest": "Cofre de hierro", "Steel chest": "Cofre de acero", "Wooden chest": "Cofre de madera", "Passive provider chest": "Cofre proveedor pasivo", "Requester chest": "Cofre solicitante",
    "Small electric pole": "Poste eléctrico pequeño", "Medium electric pole": "Poste eléctrico mediano", "Big electric pole": "Poste eléctrico grande", "Substation": "Subestación", "Lamp": "Lámpara",
    "Arithmetic combinator": "Combinador aritmético", "Decider combinator": "Combinador decisor", "Constant combinator": "Combinador constante",
    "Concrete": "Hormigón", "Refined concrete": "Hormigón refinado", "Rail": "Raíl", "Rail signal": "Señal de raíl", "Train stop": "Parada de tren", "Locomotive": "Locomotora", "Cargo wagon": "Vagón de carga", "Fluid wagon": "Vagón cisterna", "Storage tank": "Tanque de almacenamiento",
    "Car": "Coche", "Tank": "Tanque", "Roboport": "Roboport", "Logistic robot": "Robot logístico", "Construction robot": "Robot de construcción",
    "Firearm magazine": "Cargador de munición", "Piercing rounds magazine": "Cargador de munición perforante", "Shotgun shells": "Cartuchos de escopeta", "Cannon shell": "Proyectil de cañón", "Explosive cannon shell": "Proyectil de cañón explosivo",
    "Rocket": "Cohete", "Grenade": "Granada", "Land mine": "Mina terrestre", "Poison capsule": "Cápsula de veneno", "Slowdown capsule": "Cápsula de ralentización", "Defender capsule": "Cápsula defensora",
    "Wall": "Muro", "Gun turret": "Torreta de ametralladora", "Flamethrower turret": "Torreta lanzallamas", "Laser turret": "Torreta láser", "Radar": "Radar",
    "Light armor": "Armadura ligera", "Heavy armor": "Armadura pesada", "Modular armor": "Armadura modular", "Energy shield": "Escudo de energía", "Nightvision": "Visión nocturna", "Exoskeleton": "Exoesqueleto", "Power armor": "Armadura de potencia",
    "Iron ore": "Mineral de hierro", "Copper ore": "Mineral de cobre", "Coal": "Carbón", "Stone": "Piedra", "Wood": "Madera", "Water": "Agua", "Crude oil": "Petróleo crudo", "Petroleum gas": "Gas de petróleo", "Heavy oil": "Aceite pesado", "Light oil": "Aceite ligero", "Solid fuel": "Combustible sólido"
};
const t = (k, ...a) => { let s = T[LANG][k] != null ? T[LANG][k] : (T.en[k] != null ? T.en[k] : k); a.forEach((v, i) => { s = s.split("{" + i + "}").join(v) }); return s };
const nf = {};
const fmt = (n, d) => (nf[d] || (nf[d] = new Intl.NumberFormat(LANG, { maximumFractionDigits: d }))).format(n);
const f = n => fmt(n, n >= 100 ? 0 : n >= 10 ? 1 : 2);
/* names: the game's own locale (data/names.es.js, from npm run locale) -> English names from the data -> built-in Spanish list if no locale file */
const nm = id => { const L = window.NAMES && NAMES[LANG]; return (L && L[id]) || (!L && LANG == "es" && ES[pretty(id)]) || (window.NAMES && NAMES.en && NAMES.en[id]) || D.names[id] || pretty(id) };
Object.assign(T.en, {
    "phase": "Settings", "sec.prog": "Progress", "sec.bld": "Buildings and fuel", "sec.mod": "Modules, beacons and research", "sec.log": "Belts and inserters", "sec.rec": "Recipes",
    "grp.stage": "Research so far", "tt.stage": "How far you have got in the game. It decides which recipes, machines, belts and inserters can be used.|Pick the most advanced science pack you can already make.|Not sure? Blue is a safe middle.",
    "st.red": "Red science", "st.green": "Green science", "st.blue": "Blue science", "st.purple": "Purple + yellow", "st.space": "Space science", "st.all": "Other planets",
    "grp.fuel": "Fuel", "tt.fuel": "The fuel that furnaces and burner drills burn.|Better fuel means fewer items to feed them. The fuel counts toward the resources you need.|Pick what you actually burn.",
    "grp.mp": "Mining productivity", "tt.mp": "The 'Mining productivity' research: each level gives +10% ore from every drill.|More output per drill means fewer drills.|Use the number of levels you have finished.",
    "grp.oil": "Oil processing", "tt.oil": "Advanced also uses advanced oil processing and cracking, which wastes less oil. Basic uses only basic oil processing.|Pick Basic if you have not researched advanced oil processing.",
    "grp.mod": "Modules in machines", "tt.mod": "Modules are upgrades placed inside machines.|Speed: faster crafting, so fewer machines. Productivity: free extra items, but slower. Efficiency: less power.|Click to choose. Leave empty if you use none.",
    "grp.bn": "Beacons", "tt.bn": "Beacons share their modules with the machines around them. Pick the module they hold and how many reach each machine.|More beacons help each machine less than the last.|Leave at 0 if you don't use beacons.",
    "mod.none": "No module", "eff.speed": "speed", "eff.prod": "productivity", "eff.en": "energy", "eff.po": "pollution",
    "sp.oila": "Advanced + cracking", "sp.oilb": "Basic only", "sp.ist": "Stack",
    "sum.power": "power (peak)", "sum.poll": "pollution per minute", "sum.fuel": "{0} as fuel", "util": "in use", "belt1": "of a belt", "beacons": "beacons", "far": "Needs another planet",
    "nosol": "There is no way to make this with what you have unlocked.", "avg": "average", "cat.logistics": "Logistics", "cat.production": "Production", "cat.intermediate-products": "Intermediates", "cat.combat": "Combat", "cat.fluids": "Fluids", "cat.space": "Space"
});
Object.assign(T.es, {
    "phase": "Ajustes", "sec.prog": "Progreso", "sec.bld": "Edificios y combustible", "sec.mod": "Módulos, balizas e investigación", "sec.log": "Cintas e inserters", "sec.rec": "Recetas",
    "grp.stage": "Investigación hasta ahora", "tt.stage": "Hasta dónde has llegado en el juego. Decide qué recetas, máquinas, cintas e inserters se pueden usar.|Elige el paquete de ciencia más avanzado que ya puedas fabricar.|¿No sabes? Azul es un punto medio seguro.",
    "st.red": "Ciencia roja", "st.green": "Ciencia verde", "st.blue": "Ciencia azul", "st.purple": "Morada + amarilla", "st.space": "Ciencia espacial", "st.all": "Otros planetas",
    "grp.fuel": "Combustible", "tt.fuel": "El combustible que queman los hornos y las perforadoras de combustión.|Un combustible mejor necesita menos objetos para alimentarlos. El combustible cuenta como recurso necesario.|Elige el que realmente quemes.",
    "grp.mp": "Productividad minera", "tt.mp": "La investigación 'Productividad minera': cada nivel da +10% de mineral en cada perforadora.|Más producción por perforadora significa menos perforadoras.|Usa los niveles que hayas terminado.",
    "grp.oil": "Procesado de petróleo", "tt.oil": "Avanzado usa también el procesado avanzado y el craqueo, que desperdician menos petróleo. Básico solo usa el procesado básico.|Elige Básico si no has investigado el procesado avanzado.",
    "grp.mod": "Módulos en máquinas", "tt.mod": "Los módulos son mejoras que se colocan dentro de las máquinas.|Velocidad: fabrica más rápido y necesitas menos máquinas. Productividad: objetos extra gratis, pero más lento. Eficiencia: menos energía.|Pulsa para elegir. Déjalo vacío si no usas módulos.",
    "grp.bn": "Balizas", "tt.bn": "Las balizas comparten sus módulos con las máquinas de alrededor. Elige el módulo que llevan y cuántas llegan a cada máquina.|Cada baliza extra ayuda un poco menos que la anterior.|Déjalo en 0 si no usas balizas.",
    "mod.none": "Sin módulo", "eff.speed": "velocidad", "eff.prod": "productividad", "eff.en": "energía", "eff.po": "contaminación",
    "sp.oila": "Avanzado + craqueo", "sp.oilb": "Solo básico", "sp.ist": "Apilador",
    "sum.power": "potencia (pico)", "sum.poll": "contaminación por minuto", "sum.fuel": "{0} como combustible", "util": "en uso", "belt1": "de una cinta", "beacons": "balizas", "far": "Requiere otro planeta",
    "nosol": "No hay forma de fabricar esto con lo que tienes desbloqueado.", "avg": "media", "cat.logistics": "Logística", "cat.production": "Producción", "cat.intermediate-products": "Intermedios", "cat.combat": "Combate", "cat.fluids": "Fluidos", "cat.space": "Espacio"
});

Object.assign(T.en, {
    "cnt.tip": "Type how many machines you want: the whole plan and the amount adjust", "pick.sel": "Select an item",
    "node.tip": "Click to calculate only {0} ({1})", "ins.tip": "Per machine: {0} inserters in, {1} out (limit {2} each)", "items.s": "items", "view.table": "Table",
    "grp.loc": "Locations", "tt.loc": "Where your factory can be. Recipes, machines and resources that only work somewhere else are left out.|Tick every place you can build on. A recipe is used if it works on at least one of them.|Leave all ticked if you are not sure.",
    "grp.nut": "Nutrients", "tt.nut": "What biochambers eat as fuel.|Spoilage, yumako mash and jelly are all valid.",
    "loc.space-platform": "Space platform", "loc.nauvis": "Nauvis", "loc.vulcanus": "Vulcanus", "loc.gleba": "Gleba", "loc.fulgora": "Fulgora", "loc.aquilo": "Aquilo",
    "st.all": "Free (everything unlocked)", "locked": "Not unlocked at this research level", "filter": "Filter", "all.sel": "Select all",
    "tbl.recipe": "Recipe", "tbl.machine": "Machine", "tbl.mods": "Modules", "tbl.beacons": "Beacons", "tbl.prod": "Products", "tbl.by": "Byproducts", "tbl.ing": "Ingredients",
    "tier.lbl": "Machine tiers that can make it", "tier.min": "minimum", "tier.cur": "using", "tbl.note": "Each row is one recipe. Machine: how many are needed (hover for the exact number). Ingredients are what the recipe consumes per time unit, including fuel; the bolt is electric power."
});
Object.assign(T.es, {
    "cnt.tip": "Escribe cuántas máquinas quieres: todo el plan y la cantidad se ajustan", "pick.sel": "Elige un objeto",
    "node.tip": "Pulsa para calcular solo {0} ({1})", "ins.tip": "Por máquina: {0} inserters de entrada, {1} de salida (límite {2} cada uno)", "items.s": "objetos", "view.table": "Tabla",
    "grp.loc": "Ubicaciones", "tt.loc": "Dónde puede estar tu fábrica. Se descartan las recetas, máquinas y recursos que solo funcionan en otro sitio.|Marca todos los lugares donde puedas construir. Una receta se usa si funciona en al menos uno.|Déjalas todas marcadas si no estás seguro.",
    "grp.nut": "Nutrientes", "tt.nut": "Lo que comen las biocámaras como combustible.|Estropeo, puré de yumako y jalea valen.",
    "loc.space-platform": "Plataforma espacial", "loc.nauvis": "Nauvis", "loc.vulcanus": "Vulcanus", "loc.gleba": "Gleba", "loc.fulgora": "Fulgora", "loc.aquilo": "Aquilo",
    "st.all": "Libre (todo desbloqueado)", "locked": "No desbloqueado con esta investigación", "filter": "Filtrar", "all.sel": "Seleccionar todo",
    "tbl.recipe": "Receta", "tbl.machine": "Máquina", "tbl.mods": "Módulos", "tbl.beacons": "Balizas", "tbl.prod": "Productos", "tbl.by": "Subproductos", "tbl.ing": "Ingredientes",
    "tier.lbl": "Niveles de máquina que pueden fabricarlo", "tier.min": "mínimo", "tier.cur": "en uso", "tbl.note": "Cada fila es una receta. Máquina: cuántas hacen falta (pasa el ratón para ver el número exacto). Los ingredientes son lo que consume la receta por unidad de tiempo, combustible incluido; el rayo es potencia eléctrica."
});

function applyI18n() {
    document.documentElement.lang = LANG; document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = t(e.dataset.i18n) });
    document.querySelectorAll("[data-i18n-attr]").forEach(e => e.dataset.i18nAttr.split(";").forEach(p => { const [a, k] = p.split(":"); e.setAttribute(a, t(k)) }));
}

/* ---------- helpers ---------- */
/* Catalan: item names come from names.ca.js; labels below are translated, long tooltips fall back to Spanish */
T.ca = new Proxy({
    "title": "Calculadora inversa de Factorio", "subtitle": "Tria què fabricar i quant: et dic recursos, màquines i cintes.", "change": "Canvia ›", "change.aria": "Canvia l'objecte", "amount": "Quantitat", "unit": "Unitat", "per.s": "per segon", "per.m": "per minut",
    "phase": "Ajustos", "preset.start": "Inici", "preset.mid": "Mitjà", "preset.late": "Avançat", "grp.asm": "Muntadores", "grp.fur": "Forns", "grp.min": "Perforadores", "grp.belt": "Cintes", "grp.ins": "Inseridors", "grp.stk": "Capacitat dels inseridors", "grp.src": "Els inseridors agafen de",
    "grp.sf": "Recepta de combustible sòlid", "sp.chest": "Caixa", "sp.cs": "Apilat a la cinta", "sp.belt": "Cinta → caixa", "sp.sfl": "Oli lleuger", "sp.sfg": "Gas", "sp.sfh": "Oli pesat", "sp.oila": "Avançat + craqueig", "sp.oilb": "Només bàsic",
    "pick.aria": "Tria un objecte", "pick.title": "Tria què produir", "close": "Tanca", "search.ph": "Cerca un objecte…", "search.aria": "Cerca un objecte", "none": "Sense resultats", "cat.all": "Tot",
    "view.diag": "Diagrama", "view.steps": "Màquines", "view.raw": "Recursos", "view.table": "Taula", "zoom.out": "Allunya", "zoom.in": "Apropa", "zoom.fit": "Ajusta", "fs.enter": "Pantalla completa", "fs.exit": "Surt de la pantalla completa",
    "steps.title": "Passos intermedis i màquines", "ins.in": "entrada", "ins.out": "sortida", "ins.tip": "Per màquina: {0} inseridors d'entrada, {1} de sortida (límit {2} cadascun)", "raw.title": "Recursos bàsics", "base": "Aquest objecte és un recurs bàsic.",
    "sum.prod": "producció", "sum.drill": "perforadores", "sum.ins": "inseridors", "exact": "exactes", "items.s": "objectes", "belts": "cintes", "back": "← Enrere", "hint": "Prem un objecte del diagrama per calcular només aquesta subcadena, al ritme que necessita {0}.",
    "diag.aria": "Diagrama de la cadena de producció", "node.tip": "Prem per calcular només {0} ({1})",
    "sec.prog": "Progrés", "sec.bld": "Edificis i combustible", "sec.mod": "Mòduls, balises i recerca", "sec.log": "Cintes i inseridors", "sec.rec": "Receptes",
    "grp.stage": "Recerca fins ara", "grp.loc": "Ubicacions", "grp.fuel": "Combustible", "grp.nut": "Nutrients", "grp.mp": "Productivitat minera", "grp.oil": "Processament de petroli", "grp.mod": "Mòduls a les màquines", "grp.bn": "Balises",
    "st.red": "Ciència vermella", "st.green": "Ciència verda", "st.blue": "Ciència blava", "st.purple": "Lila + groga", "st.space": "Ciència espacial", "st.all": "Lliure (tot desbloquejat)",
    "loc.space-platform": "Plataforma espacial", "loc.nauvis": "Nauvis", "loc.vulcanus": "Vulcanus", "loc.gleba": "Gleba", "loc.fulgora": "Fulgora", "loc.aquilo": "Aquilo",
    "mod.none": "Sense mòdul", "sum.power": "potència (pic)", "sum.poll": "contaminació per minut", "sum.fuel": "{0} com a combustible", "util": "en ús", "belt1": "d'una cinta", "beacons": "balises", "far": "Requereix un altre planeta",
    "nosol": "No hi ha manera de fabricar-ho amb el que tens desbloquejat.", "avg": "mitjana", "locked": "No desbloquejat amb aquesta recerca", "filter": "Filtra", "all.sel": "Selecciona-ho tot",
    "tbl.recipe": "Recepta", "tbl.machine": "Màquina", "tbl.mods": "Mòduls", "tbl.beacons": "Balises", "tbl.prod": "Productes", "tbl.by": "Subproductes", "tbl.ing": "Ingredients", "tier.lbl": "Nivells de màquina que ho poden fabricar", "tier.min": "mínim", "tier.cur": "en ús",
    "cnt.tip": "Escriu quantes màquines vols: tot el pla i la quantitat s'ajusten", "pick.sel": "Tria un objecte"
}, { get: (o, k) => k in o ? o[k] : T.es[k] });
/* ---------- settings: every number behind them comes from data.js (the game's own data) ---------- */
const ALLLOC = D.locs.map(l => l.id);
const PRE = {
    start: { stage: "red", loc: ["nauvis"], asm: 1, fur: "stone", min: "burner", fuel: "coal", nut: "nutrients", belt: "y", ins: "basic", stk: 0, src: "c", mod: "", bmod: "", bn: 0, mp: 0, oil: "b", sf: "l" },
    mid: { stage: "blue", loc: ["nauvis"], asm: 2, fur: "steel", min: "elec", fuel: "coal", nut: "nutrients", belt: "r", ins: "fast", stk: 2, src: "c", mod: "", bmod: "", bn: 0, mp: 1, oil: "a", sf: "l" },
    late: { stage: "all", loc: ALLLOC, asm: 3, fur: "elec", min: "big", fuel: "solid-fuel", nut: "nutrients", belt: "b", ins: "bulk", stk: 7, src: "c", mod: "productivity-module-3", bmod: "speed-module-3", bn: 8, mp: 3, oil: "a", sf: "l" }
};
const S = { ...PRE.mid, stage: "all", loc: ALLLOC }; /* default: free, everything unlocked, every location */
let sel = "electronic-circuit", cat = "all", q = "", ex = null, path = [], view = "diag", RES = null, USE = null, POP = null;
const cl = Engine.cl, isMin = () => $("#unit").value == "m", R = v => f(v * (isMin() ? 60 : 1)) + (isMin() ? "/min" : "/s");
const beltIps = n => (D.belts.find(b => b.n == n) || { ips: 0 }).ips;
const P = kw => kw >= 1000 ? fmt(kw / 1000, 2) + " MW" : fmt(kw, 0) + " kW";
const K = v => v >= 1e6 ? fmt(v / 1e6, 1) + "M" : v >= 1e4 ? fmt(v / 1e3, 0) + "k" : v >= 1e3 ? fmt(v / 1e3, 1) + "k" : f(v);
const ico = (n, s) => { const c = ICON.pos[n]; if (!c) return null; const k = s / 64; return `<span class="ico" style="width:${s}px;height:${s}px;background-size:${ICON.sheet[0] * k}px ${ICON.sheet[1] * k}px;background-position:-${c[0] * k}px -${c[1] * k}px"></span>` };
const img = (n, s = 32) => n && n[0] == "!" ? `<span class="ph" style="width:${s}px;height:${s}px">${n.slice(1)}</span>` : ico(n, s) || `<span class="ph" style="width:${s}px;height:${s}px">${E((n && nm(n)[0]) || "?")}</span>`;
const tile = (n, s = 32) => `<span class="t">${img(n, s)}</span>`;
const locName = id => T[LANG]["loc." + id] || pretty(id);
const FUELCATS = new Set(Object.values(D.machines).flatMap(m => m.fc));
const FIRST = ["wood", "coal", "solid-fuel", "rocket-fuel", "nuclear-fuel"];
const fuelList = nut => D.fuels.filter(id => (D.items[id].fcat == "nutrients") == nut && FUELCATS.has(D.items[id].fcat)).sort((a, b) => (FIRST.indexOf(a) + 1 || 99) - (FIRST.indexOf(b) + 1 || 99) || nm(a).localeCompare(nm(b)));
const STAGEICON = { red: "automation-science-pack", green: "logistic-science-pack", blue: "chemical-science-pack", purple: "production-science-pack", space: "space-science-pack", all: "g:all" };
/* option lists for the settings panel; options whose item is not unlocked (or not buildable on the chosen locations) are hidden */
const G = [
    { k: "loc", type: "combo", sec: "prog" }, { k: "stage", type: "combo", sec: "prog" },
    { k: "asm", type: "icons", sec: "bld", o: () => [1, 2, 3].map(v => ({ v, ic: "assembling-machine-" + v, det: "×" + D.machines["assembling-machine-" + v].s })) },
    { k: "fur", type: "icons", sec: "bld", o: () => Object.entries(Engine.FUR).map(([v, n]) => ({ v, ic: n, det: "×" + D.machines[n].s })) },
    { k: "min", type: "icons", sec: "bld", o: () => Object.entries(Engine.DRL).map(([v, n]) => ({ v, ic: n, det: f(D.machines[n].s) + "/s" })) },
    { k: "fuel", type: "combo", sec: "bld" }, { k: "nut", type: "combo", sec: "bld" },
    { k: "mod", type: "mod", sec: "mod" }, { k: "bn", type: "beacon", sec: "mod" },
    { k: "mp", type: "pills", sec: "mod", o: () => [0, 1, 2, 3].map(v => ({ v, txt: "+" + v * 10 + "%" })) },
    { k: "belt", type: "icons", sec: "log", o: () => Object.entries(Engine.BELT).map(([v, n]) => ({ v, ic: n, det: R(beltIps(n)) })) },
    { k: "ins", type: "icons", sec: "log", o: () => Object.entries(Engine.NAME).map(([v, n]) => ({ v, ic: n, det: R(Engine.insRate(D, { ...S, ins: v })) })) },
    { k: "stk", type: "pills", sec: "log", o: () => [0, 2, 7, "s"].map(v => ({ v, txt: v == "s" ? t("sp.cs") : "+" + v, tip: tk("to.stk." + v) })) },
    { k: "src", type: "pills", sec: "log", o: () => [["c", "sp.chest"], ["b", "sp.belt"]].map(([v, k]) => ({ v, txt: t(k), tip: tk("to.src." + v) })) },
    { k: "oil", type: "pills", sec: "rec", o: () => [["a", "sp.oila"], ["b", "sp.oilb"]].map(([v, k]) => ({ v, txt: t(k) })) },
    { k: "sf", type: "pills", sec: "rec", o: () => [["l", "sp.sfl"], ["g", "sp.sfg"], ["h", "sp.sfh"]].map(([v, k]) => ({ v, txt: t(k), tip: tk("to.sf." + v) })) }
];
/* dropdowns (FactorioLab style): icon + name rows with a filter; "multi" ones have checkboxes */
const COMBO = {
    loc: { multi: true, items: () => D.locs.map(l => ({ v: l.id, ic: "loc:" + l.id, name: locName(l.id) })) },
    stage: { items: () => ["all", "red", "green", "blue", "purple", "space"].map(v => ({ v, ic: STAGEICON[v], name: t("st." + v) })) },
    fuel: { items: () => fuelList(false).map(v => ({ v, ic: v, name: nm(v), det: f(D.items[v].fv / 1000) + " MJ" })) },
    nut: { items: () => fuelList(true).map(v => ({ v, ic: v, name: nm(v), det: f(D.items[v].fv / 1000) + " MJ" })) }
};
const comboSel = k => { const c = COMBO[k], it = c.items(); return c.multi ? it.filter(o => S[k].includes(o.v)) : [it.find(o => o.v == S[k]) || it[0]] };
const comboBtn = k => { const s = comboSel(k), c = COMBO[k]; return c.multi ? s.map(o => img(o.ic, 30)).join("") + `<span class="cn">${s.length}/${c.items().length}</span>` : (s[0] ? img(s[0].ic, 30) + `<span class="cn">${E(s[0].name)}${s[0].det ? " · " + E(s[0].det) : ""}</span>` : "") };
const okOpt = o => !o.ic || Engine.has(D, S, o.ic);
const optTxt = o => o.ic ? nm(o.ic) + (o.det ? " · " + o.det : "") : o.txt;
const curOpt = g => { const os = g.o().filter(okOpt); return os.find(o => String(o.v) == String(S[g.k])) || os[0] };
function clamp() {
    if (!Array.isArray(S.loc) || !(S.loc = S.loc.filter(l => ALLLOC.includes(l))).length) S.loc = ALLLOC.slice();
    if (S.mod && !Engine.has(D, S, S.mod)) S.mod = ""; if (S.bmod && !Engine.has(D, S, S.bmod)) S.bmod = "";
    for (const g of G) { if (!g.o) continue; const os = g.o().filter(okOpt); if (os.length && !os.some(o => String(o.v) == String(S[g.k]))) S[g.k] = os[os.length - 1].v }
}
function useOf(r) {
    if (!r) return null; const st = r.steps, any = st.some(s => !s.mine);
    return { loc: true, stage: true, asm: st.some(s => /^assembling/.test(s.machine)), fur: st.some(s => Object.values(Engine.FUR).includes(s.machine)), min: st.some(s => s.mine && s.kind == "m" && !/pumpjack/.test(s.machine)), fuel: st.some(s => s.fuel && D.items[s.fuel[0]].fcat != "nutrients"), nut: st.some(s => s.fuel && D.items[s.fuel[0]].fcat == "nutrients"),
        belt: st.some(s => s.belts > 0), ins: any, stk: any, src: any, mod: any, bn: any, mp: st.some(s => s.mine), oil: st.some(s => /oil-processing|liquefaction/.test(s.id)), sf: st.some(s => s.id.startsWith("solid-fuel")) };
}
/* persistence */
const KEY = "frc4";
function save() { try { localStorage.setItem(KEY, JSON.stringify({ S, sel, v: $("#rate").value, u: $("#unit").value, view })) } catch (_) { } }
function load() { try { const d = JSON.parse(localStorage.getItem(KEY) || "null"); if (!d) return; for (const k in d.S) if (k in S) S[k] = d.S[k]; if (D.items[d.sel]) sel = d.sel; if (d.v) $("#rate").value = d.v; if (d.u) $("#unit").value = d.u; if (["diag", "steps", "raw", "table"].includes(d.view)) view = d.view } catch (_) { } }
const small = () => matchMedia("(max-width:899px)").matches;
const curRate = () => ex != null ? ex : (parseFloat($("#rate").value) || 0) / (isMin() ? 60 : 1);
function setRate(v) { ex = v; $("#rate").value = +(isMin() ? v * 60 : v).toFixed(4) }
const matches = n => (n + " " + nm(n)).toLowerCase().includes(q);
const catName = k => k == "all" ? t("cat.all") : tk("cat." + k) || pretty(k);

function drawPick() {
    const all = Engine.craftable(D, S).filter(i => D.items[i]), gs = [...new Set(all.map(i => D.items[i].g))];
    if (cat != "all" && !gs.includes(cat)) cat = "all";
    $("#tabs").innerHTML = ["all", ...gs].map(k => `<button class="gtab" data-k="${k}" aria-pressed="${k == cat}" aria-label="${E(catName(k))}" data-ttl="${E(catName(k))}" data-tip="${E(catName(k))}">${img("g:" + k, 30)}<span>${E(catName(k))}</span></button>`).join("");
    const ns = all.filter(n => (cat == "all" || D.items[n].g == cat) && matches(n)).sort((a, b) => nm(a).localeCompare(nm(b), LANG));
    $("#pick").innerHTML = ns.map(n => `<button class="pick" data-id="${n}" aria-pressed="${n == sel}" title="${E(nm(n))}">${tile(n, 38)}<span>${E(nm(n))}</span></button>`).join("") || `<p class="note">${t("none")}</p>`;
}
const effTxt = n => { const m = D.modules.find(x => x.n == n), z = (v, k) => v ? `${v > 0 ? "+" : ""}${Math.round(v * 100)}% ${t(k)}` : ""; return [z(m.sp, "eff.speed"), z(m.pr, "eff.prod"), z(m.en, "eff.en"), z(m.po, "eff.po")].filter(Boolean).join(", ") };
function rowHTML(g) {
    const k = g.k; let ctl, cur = "";
    if (g.type == "combo") ctl = `<button class="cbtn" data-combo="${k}" aria-haspopup="listbox" aria-label="${E(t("grp." + k))}">${comboBtn(k)}<span class="chev2">▾</span></button>`;
    else if (g.type == "mod" || g.type == "beacon") {
        const key = k == "mod" ? "mod" : "bmod", v = S[key];
        ctl = `<button class="ib" data-pick="${key}" aria-haspopup="dialog" aria-label="${E(t("grp." + k))}" data-ttl="${E(t("grp." + k))}" data-tip="${E(v ? nm(v) + "|" + effTxt(v) : t("mod.none"))}">${v ? img(v, 40) : img("!∅", 40)}</button><span class="cur">${v ? E(nm(v)) : t("mod.none")}</span>`;
        if (g.type == "beacon") ctl += `<span class="x">×</span><input class="nin" type="number" min="0" max="64" step="1" value="${S.bn}" data-num="bn" aria-label="${E(t("grp.bn"))}">`;
    } else {
        const os = g.o().filter(okOpt), cu = curOpt(g); cur = cu ? optTxt(cu) : "";
        ctl = os.map(o => `<button class="${g.type == "icons" ? "ib" : "pill"}" data-k="${k}" data-v="${o.v}" aria-pressed="${String(S[k]) == String(o.v)}" data-ttl="${E(optTxt(o))}" data-tip="${E(o.tip || optTxt(o))}"${o.ic ? ` aria-label="${E(nm(o.ic))}"` : ""}>${g.type == "icons" ? img(o.ic, 38) : E(o.txt)}</button>`).join("");
    }
    return `<div class="row2"><div class="lab"><label data-ttl="${E(t("grp." + k))}" data-tip="${E(t("tt." + k))}">${t("grp." + k)}</label>${cur && g.type == "icons" ? `<small>${E(cur)}</small>` : ""}</div><div class="ctl">${ctl}</div></div>`;
}
function drawMach() {
    tipHide(); clamp();
    const vis = G.filter(g => !USE || USE[g.k]);
    $("#mach").innerHTML = (vis.length ? `<p class="note">${t("cfg.hint")}</p>` : "") + `<div class="set">` + ["prog", "bld", "mod", "log", "rec"].map(sc => { const rows = vis.filter(g => g.sec == sc).map(rowHTML).join(""); return rows ? `<section class="sec"><h3>${t("sec." + sc)}</h3>${rows}</section>` : "" }).join("") + `</div>`;
    $("#cfgsum").innerHTML = ["asm", "fur", "min", "ins"].filter(k => !USE || USE[k]).map(k => { const o = curOpt(G.find(g => g.k == k)); return o && o.ic ? img(o.ic, 24) : "" }).join("");
}
/* popups: module picker (like Kirk McDonald's) and dropdowns (like FactorioLab's) */
function closePop() { if (POP) { const dirty = POP.dirty; POP.d.remove(); POP = null; if (dirty) render() } }
function place(d, btn, minW) {
    const r = btn.getBoundingClientRect(); d.style.minWidth = Math.max(minW || 0, r.width) + "px"; const w = d.offsetWidth, h = d.offsetHeight;
    d.style.left = (Math.max(8, Math.min(innerWidth - w - 8, r.left)) + scrollX) + "px"; d.style.top = ((r.bottom + 6 + h > innerHeight && r.top - h - 6 > 8 ? r.top - h - 6 : r.bottom + 6) + scrollY) + "px";
}
function openPop(btn) {
    closePop(); tipHide(); const key = btn.dataset.pick, beacon = key == "bmod";
    const mods = D.modules.filter(m => ["speed", "efficiency", "productivity"].includes(m.cat) && (!beacon || m.pr == 0 || D.beacon.ae.includes("productivity")));
    const rows = [[""], ...["speed", "efficiency", "productivity"].map(c => mods.filter(m => m.cat == c).sort((a, b) => a.tier - b.tier).map(m => m.n))].filter(r => r.length);
    const d = document.createElement("div"); d.className = "mpop"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", t("grp." + (beacon ? "bn" : "mod")));
    d.innerHTML = rows.map(r => `<div class="mrow">${r.map(n => { const lock = n && !Engine.has(D, S, n); return `<button class="ib${lock ? " lock" : ""}" data-m="${n}" aria-pressed="${S[key] == n}"${lock ? " aria-disabled=\"true\"" : ""} aria-label="${E(n ? nm(n) : t("mod.none"))}" data-ttl="${E(n ? nm(n) : t("mod.none"))}" data-tip="${E(n ? effTxt(n) + (lock ? "|" + t("locked") : "") : t("mod.none"))}">${n ? img(n, 40) : img("!∅", 40)}</button>` }).join("")}</div>`).join("");
    document.body.appendChild(d); POP = { d, key, btn }; place(d, btn);
    (d.querySelector("[aria-pressed=true]") || d.querySelector("button")).focus();
}
function openCombo(btn) {
    closePop(); tipHide(); const k = btn.dataset.combo, c = COMBO[k], items = c.items();
    const d = document.createElement("div"); d.className = "cpop"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", t("grp." + k));
    const rows = () => { const fq = d.querySelector("input[type=search]").value.trim().toLowerCase(); d.querySelector(".clist").innerHTML = items.filter(o => !fq || o.name.toLowerCase().includes(fq)).map(o => { const on = c.multi ? S[k].includes(o.v) : S[k] == o.v;
        return c.multi ? `<label class="crow"><input type="checkbox" data-cv="${o.v}"${on ? " checked" : ""}>${img(o.ic, 32)}<span>${E(o.name)}</span></label>` : `<button class="crow" data-cv="${o.v}" aria-pressed="${on}">${img(o.ic, 32)}<span>${E(o.name)}</span>${o.det ? `<small>${E(o.det)}</small>` : ""}</button>` }).join("") };
    d.innerHTML = (c.multi ? `<label class="crow all"><input type="checkbox" data-all${items.every(o => S[k].includes(o.v)) ? " checked" : ""}><b>${t("all.sel")}</b></label>` : "") + `<input type="search" placeholder="${E(t("filter"))}" aria-label="${E(t("filter"))}"><div class="clist"></div>`;
    document.body.appendChild(d); POP = { d, key: k, btn, combo: true }; rows(); place(d, btn, 280);
    d.querySelector("input[type=search]").oninput = rows; d.querySelector("input[type=search]").focus();
}
function comboPick(el) {
    const k = POP.key, c = COMBO[k];
    if (el.matches("[data-all]")) S[k] = el.checked ? ALLLOC.slice() : [S[k][0] || "nauvis"];
    else if (c.multi) { const v = el.dataset.cv; S[k] = el.checked ? [...new Set([...S[k], v])] : S[k].filter(x => x != v); if (!S[k].length) { S[k] = [v]; el.checked = true } }
    else { S[k] = el.dataset.cv; closePop(); render(); return }
    POP.dirty = true; POP.btn.innerHTML = comboBtn(k) + `<span class="chev2">▾</span>`;
    POP.d.querySelectorAll("[data-cv]").forEach(b => { b.checked = S[k].includes(b.dataset.cv) }); const a = POP.d.querySelector("[data-all]"); if (a) a.checked = ALLLOC.every(l => S[k].includes(l));
}
function showView() {
    for (const v of ["diag", "steps", "raw", "table"]) $("#v-" + v).hidden = v != view;
    document.querySelectorAll("#views .btn").forEach(b => b.setAttribute("aria-pressed", b.dataset.v == view));
}
function drill(n) { const tt = RES && RES.flow[n]; if (!(tt > 0)) return; path.push({ n: sel, r: curRate() }); sel = n; setRate(tt); drawPick(); render() }
function drawCrumbs() {
    const c = $("#crumbs");
    if (!path.length) { c.innerHTML = `<span class="note" style="margin:0">${t("hint", nm(sel))}</span>`; return }
    c.innerHTML = `<button class="btn" data-i="${path.length - 1}">${t("back")}</button>` + path.map((p, i) => `<button class="btn" data-i="${i}">${img(p.n, 18)} ${nm(p.n)} · ${R(p.r)}</button>`).join(" › ") + ` › <b>${nm(sel)} · ${R(curRate())}</b>`;
}
const cnt = s => `<input class="cnt" type="number" min="1" step="1" value="${s.whole}" data-sid="${s.id}" title="${E(t("cnt.tip"))}" aria-label="${E(nm(s.machine))}">`;
function setMachines(id, n) { const s = RES && RES.steps.find(x => x.id == id); if (!s || !(n > 0) || !(s.count > 0)) { if (RES) render(); return } setRate(curRate() * n / s.count); render() }
const beltTxt = b => b < 1 ? `${f(b * 100)}% ${t("belt1")}` : `${f(b)} ${t("belts")}`;
function chips(s, eff) {
    const ins = Engine.NAME[S.ins] || "inserter", c = [];
    c.push(`<span class="chip">${img(s.machine, 16)} ${E(nm(s.machine))} · ×${f(eff)}</span>`);
    if (s.kw > 0) c.push(`<span class="chip" title="${t("avg")}: ${P(s.kwAvg)}">⚡ ${P(s.kw)}</span>`);
    if (s.fuel) c.push(`<span class="chip" title="${E(nm(s.fuel[0]))}">${img(s.fuel[0], 16)} ${R(s.fuel[1])} · ${P(s.heat)}</span>`);
    if (s.poll > 0) c.push(`<span class="chip">☁ ${f(s.poll)}/min</span>`);
    if (s.prod > 0) c.push(`<span class="chip">+${Math.round(s.prod * 100)}%</span>`);
    if (s.beacons) c.push(`<span class="chip">${s.beacons} ${t("beacons")}</span>`);
    if (!s.mine && (s.inn + s.out)) c.push(`<span class="chip" title="${t("ins.tip", s.inn, s.out, R(s.ir))}">${img(ins, 16)} ${s.inn} ${t("ins.in")} + ${s.out} ${t("ins.out")} · ${Math.round(s.util * 100)}% ${t("util")}</span>`);
    c.push(`<span class="chip">${R(s.rate)} ${t("items.s")}</span>`);
    if (s.belts > 0) c.push(`<span class="chip">${beltTxt(s.belts)}</span>`);
    return c.join("");
}
/* machine tiers able to make the recipe, slowest (= minimum tier) first, each with how many it would take */
const tiers = s => s.alts && s.alts.length > 1 ? `<div class="tiers" title="${E(t("tier.lbl"))}">${s.alts.map(([m, c, w], i) => `<span class="tier${m == s.machine ? " cur" : ""}" title="${E(nm(m))}${i == 0 ? " · " + t("tier.min") : ""}${m == s.machine ? " · " + t("tier.cur") : ""}">${img(m, 22)}<b>${w}</b>${i == 0 ? `<i>${t("tier.min")}</i>` : ""}</span>`).join("")}</div>` : "";
const badge = (id, txt, title, cls) => `<span class="bd${cls ? " bd-" + cls : ""}" title="${E(title || nm(id))}">${img(id, 34)}<b>${txt}</b></span>`;
function drawTable(res) {
    const hd = ["recipe", "machine", "mods", "beacons", "prod", "by", "ing"].map(k => `<div class="th">${t("tbl." + k)}</div>`).join(""), U = isMin() ? 60 : 1;
    const rows = res.steps.slice().reverse().map(s => {
        const mods = s.mod && s.modN ? badge(s.mod, s.modN, nm(s.mod)) : "", bec = s.beacons && s.bmod ? badge(s.bmod, s.bn, nm(s.bmod) + " ×" + s.bn) + badge("beacon", s.beacons, nm("beacon") + " ×" + s.beacons) : "";
        const prod = s.outs.filter(o => o[0] == s.item).map(([k, v]) => badge(k, K(v * U), nm(k) + ": " + R(v), "prod")).join(""), by = s.outs.filter(o => o[0] != s.item).map(([k, v]) => badge(k, K(v * U), nm(k) + ": " + R(v), "by")).join("");
        const ing = s.ins.map(([k, v]) => badge(k, K(v * U), nm(k) + ": " + R(v), "ing")).join("") + (s.kw > 0 ? badge("!⚡", K(s.kw), P(s.kw) + " (" + t("avg") + " " + P(s.kwAvg) + ")", "pw") : "");
        return `<div class="td">${badge(s.item, "", nm(s.item) + " (" + s.id + ")", "rec")}</div><div class="td">${badge(s.machine, "", nm(s.machine) + ": " + f(s.count))}${cnt(s)}</div><div class="td">${mods}</div><div class="td">${bec}</div><div class="td">${prod}</div><div class="td">${by}</div><div class="td wrap">${ing}</div>`;
    }).join("");
    $("#table").innerHTML = `<div class="ptable">${hd}${rows}</div>`;
}
function render(keep) {
    clamp(); const r = curRate(); RES = Engine.solve(D, S, sel, r);
    USE = useOf(RES); if (!keep) drawMach(); drawPick();
    $("#curicon").innerHTML = img(sel, 40); $("#curname").textContent = nm(sel);
    if (!RES || !RES.steps.length) { $("#sum").innerHTML = ""; $("#raw").innerHTML = ""; $("#diag").innerHTML = ""; $("#table").innerHTML = ""; $("#steps").innerHTML = `<p class="note">${t(RES ? "base" : "nosol")}</p>`; drawCrumbs(); save(); return }
    RES.flow = {}; RES.steps.forEach(s => s.outs.forEach(([k, v]) => RES.flow[k] = (RES.flow[k] || 0) + v));
    const crafted = RES.steps.filter(s => !s.mine), mined = RES.steps.filter(s => s.mine);
    const top = Object.entries(RES.by).filter(([m]) => crafted.some(s => s.machine == m)).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const drills = mined.filter(s => s.kind == "m").reduce((a, s) => a + s.whole, 0), fuel = Object.entries(RES.fuel).sort((a, b) => b[1] - a[1])[0];
    const insI = Engine.NAME[S.ins] || "inserter", minI = curOpt(G.find(g => g.k == "min")).ic;
    $("#sum").innerHTML = [[sel, R(r), t("sum.prod")], ...top.map(([m, c]) => [m, c, nm(m)]), [minI, drills, t("sum.drill")], [insI, RES.inserters, t("sum.ins")], ["!⚡", P(RES.kw), t("sum.power")], ["!☁", f(RES.poll), t("sum.poll")], fuel ? [fuel[0], R(fuel[1]), t("sum.fuel", nm(fuel[0]))] : null].filter(x => x && x[1]).map(([i, v, l]) => `<div>${img(i, 30)}<div><b>${v}</b><span>${E(l)}</span></div></div>`).join("");
    $("#steps").innerHTML = RES.steps.map(s => {
        const rc = D.recipes[s.id], eff = rc.t / s.tr, ings = rc.i.map(([g, a]) => `<span class="ing" title="${E(nm(g))}">${img(g, 18)}<b>${a}</b></span>`).join(""), o = rc.r.find(x => x[0] == s.item), by = s.outs.filter(x => x[0] != s.item).map(([k, v]) => `<span class="chip" title="${E(nm(k))}">${img(k, 16)} ${R(v)}</span>`).join("");
        return `<div class="rc">${tile(s.item, 36)}<div><div class="nm">${E(nm(s.item))}</div><div class="rec">${ings}<span>→ ${fmt(o[1] * (1 + s.prod), 2)}× · ${fmt(rc.t, 2)} s → ${fmt(s.tr, 2)} s</span></div></div><div class="ct">${cnt(s)}<small>${f(s.count)} ${t("exact")}</small></div><div class="meta">${chips(s, eff)}${by}${tiers(s)}</div></div>`;
    }).join("") || `<p class="note">${t("base")}</p>`;
    $("#raw").innerHTML = mined.map(s => `<div class="rc">${tile(s.item, 36)}<div class="nm">${E(nm(s.item))}</div><div class="ct">${cnt(s)}<small>${E(nm(s.machine))}</small></div><div class="meta">${chips(s, D.recipes[s.id].t / s.tr)}${tiers(s)}</div></div>`).join("")
        + RES.raw.map(([i, v]) => `<div class="rc">${tile(i, 36)}<div class="nm">${E(nm(i))}</div><div class="ct"></div><div class="meta"><span class="chip">${t("far")}</span><span class="chip">${R(v)}</span></div></div>`).join("");
    drawTable(RES); diagram(RES); drawCrumbs(); save();
}
/* ---------- diagram ---------- */

const fsOn = () => $("#v-diag").classList.contains("fs");
/* pan & zoom viewer: the SVG fills the viewport and an inner <g> carries the transform */
const VW = { x: 0, y: 0, k: 1, auto: true, W: 1, H: 1 };
const KMIN = .15, KMAX = 3;
const world = () => $("#world");
function applyView() { const g = world(); if (g) g.setAttribute("transform", `translate(${VW.x.toFixed(1)} ${VW.y.toFixed(1)}) scale(${VW.k.toFixed(4)})`) }
function clampView() {
    const el = $("#diag"), w = el.clientWidth, h = el.clientHeight, m = 80;
    if (!w || !h) return;
    VW.x = Math.min(w - m, Math.max(m - VW.W * VW.k, VW.x));
    VW.y = Math.min(h - m, Math.max(m - VW.H * VW.k, VW.y));
}
function fitView() {
    const el = $("#diag"), w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    const pad = 16, k = Math.min((w - pad * 2) / VW.W, (h - pad * 2) / VW.H, fsOn() ? 2.2 : 1.15);
    VW.k = Math.max(KMIN, k); VW.x = (w - VW.W * VW.k) / 2; VW.y = (h - VW.H * VW.k) / 2; VW.auto = true; applyView();
}
function zoomAt(cx, cy, fct) {
    const k = Math.min(KMAX, Math.max(KMIN, VW.k * fct)), r = k / VW.k;
    VW.x = cx - (cx - VW.x) * r; VW.y = cy - (cy - VW.y) * r; VW.k = k; VW.auto = false; clampView(); applyView();
}
const zoomCenter = fct => { const el = $("#diag"); zoomAt(el.clientWidth / 2, el.clientHeight / 2, fct) };
function initPanZoom() {
    const el = $("#diag"), P = new Map(); let last = null, moved = false, drag = false;
    const rel = e => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } };
    const pinch = () => { const [a, b] = [...P.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
    el.addEventListener("pointerdown", e => {
        if (e.pointerType == "mouse" && e.button != 0) return;
        P.set(e.pointerId, rel(e)); moved = false;
        last = P.size == 2 ? pinch() : null;
    });
    el.addEventListener("pointermove", e => {
        if (!P.has(e.pointerId)) return;
        const p = rel(e), o = P.get(e.pointerId), dx = p.x - o.x, dy = p.y - o.y;
        if (!drag && P.size == 1 && Math.hypot(dx, dy) < 5) return;
        if (!drag) { drag = true; moved = true; el.classList.add("drag"); try { el.setPointerCapture(e.pointerId) } catch (_) { } }
        P.set(e.pointerId, p);
        if (P.size == 2) {
            const n = pinch();
            if (last) { zoomAt(n.x, n.y, n.d / last.d); VW.x += n.x - last.x; VW.y += n.y - last.y; clampView(); applyView() }
            last = n;
        } else { VW.x += dx; VW.y += dy; VW.auto = false; clampView(); applyView() }
    });
    const up = e => {
        if (!P.delete(e.pointerId)) return;
        try { el.releasePointerCapture(e.pointerId) } catch (_) { }
        last = P.size == 2 ? pinch() : null;
        if (!P.size) { drag = false; el.classList.remove("drag"); if (moved) setTimeout(() => { moved = false }, 0) }
    };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    /* a drag must not count as a click on a node */
    el.addEventListener("click", e => { if (moved) { e.stopImmediatePropagation(); e.preventDefault() } }, true);
    el.addEventListener("wheel", e => { e.preventDefault(); const p = rel(e); zoomAt(p.x, p.y, Math.exp(-e.deltaY * (e.deltaMode == 1 ? .05 : .0015))) }, { passive: false });
    el.addEventListener("dblclick", e => { if (e.target.closest(".nd")) return; const p = rel(e); zoomAt(p.x, p.y, 1.6) });
}
const svgIcon = (n, x, y, s) => { const c = ICON.pos[n]; return c ? `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="${c[0]} ${c[1]} 64 64"><image href="data/icons.webp" width="${ICON.sheet[0]}" height="${ICON.sheet[1]}"/></svg>` : `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="4" fill="var(--bd)"/>` };
function diagram(res) {
    const ids = res.steps.map(s => s.id), dep = res.dep, S_ = {}; res.steps.forEach(s => S_[s.id] = s);
    const pairs = {}; for (const [k, v] of Object.entries(res.edges)) { const [ab, item] = k.split("|"), [a, b] = ab.split(">"); (pairs[ab] ||= { a, b, list: [] }).list.push([item, v]) }
    const maxD = Math.max(...ids.map(i => dep[i])), W = 250, H = 80, GX = 120, GY = 28;
    const cols = []; for (let c = 0; c <= maxD; c++)cols.push([]);
    ids.forEach(i => cols[maxD - dep[i]].push(i));
    const maxN = Math.max(...cols.map(c => c.length)), totH = maxN * (H + GY) + GY, totW = (maxD + 1) * (W + GX) - GX + 20;
    const keep = !VW.auto && VW.sel === sel; VW.W = totW; VW.H = totH; VW.sel = sel;
    const pos = {};
    cols.forEach((col, c) => { const h = col.length * (H + GY) - GY, y0 = (totH - h) / 2; col.forEach((i, k) => pos[i] = { x: 10 + c * (W + GX), y: y0 + k * (H + GY) }) });
    const mx = Math.max(...Object.values(res.edges), 1e-9);
    let s = `<svg width="100%" height="100%" role="img" aria-label="${t("diag.aria")}"><g id="world">`, lab = "";
    for (const pr of Object.values(pairs)) {
        const p = pos[pr.a], qq = pos[pr.b], n = pr.list.length;
        pr.list.sort((a, b) => b[1] - a[1]).forEach(([item, v], j) => {
            const oy = (j - (n - 1) / 2) * 12, x1 = p.x + W, y1 = p.y + H / 2 + oy, x2 = qq.x, y2 = qq.y + H / 2 + oy, mxp = (x1 + x2) / 2, col = (ICON.pos[item] || [0, 0, "#c98a00"])[2];
            s += `<path d="M${x1} ${y1}C${mxp} ${y1} ${mxp} ${y2} ${x2} ${y2}" fill="none" stroke="${col}" stroke-opacity=".75" stroke-width="${(2 + 9 * v / mx).toFixed(1)}"><title>${E(nm(item))}: ${R(v)}</title></path>`;
            const ly = (y1 + y2) / 2 - 8; lab += `<g><rect x="${mxp - 36}" y="${ly}" width="72" height="17" rx="8" fill="var(--card)" stroke="var(--bd)"/>${svgIcon(item, mxp - 33, ly + 1.5, 14)}<text x="${mxp - 15}" y="${ly + 12.5}" font-size="11" fill="var(--fg)">${R(v)}</text></g>`;
        });
    }
    s += lab;
    for (const i of ids) {
        const n = S_[i], p = pos[i], full = nm(n.item), label = full.length > 20 ? full.slice(0, 19) + "…" : full, clk = !n.mine && n.item != sel, col = (ICON.pos[n.item] || [0, 0, "#888"])[2];
        const sub = "×" + n.whole + " " + nm(n.machine);
        s += `<g class="nd" data-i="${n.item}"${clk ? ' tabindex="0" role="button"' : ""}><title>${E(clk ? t("node.tip", full, R(n.rate)) : full)}</title><rect x="${p.x}" y="${p.y}" width="${W}" height="${H}" rx="9" fill="var(--card)" stroke="${n.item == sel ? "var(--acc)" : "var(--bd)"}" stroke-width="${n.item == sel ? 3 : 1.5}"/><rect x="${p.x}" y="${p.y + 6}" width="5" height="${H - 12}" rx="2" fill="${col}"/>`;
        s += svgIcon(n.item, p.x + 12, p.y + 15, 50);
        s += `<text x="${p.x + 72}" y="${p.y + 26}" font-size="15" font-weight="700" fill="var(--fg)">${E(label)}</text>`;
        s += `<text x="${p.x + 72}" y="${p.y + 45}" font-size="13" fill="var(--mut)">${R(n.rate)}${n.kw > 0 ? " · ⚡ " + P(n.kw) : ""}</text>`;
        s += svgIcon(n.machine, p.x + 72, p.y + 52, 20) + `<text x="${p.x + 96}" y="${p.y + 67}" font-size="13" fill="var(--ok)">${E(sub.length > 22 ? sub.slice(0, 21) + "…" : sub)}</text></g>`;
    }
    $("#diag").innerHTML = s + "</g></svg>";
    if (keep) { clampView(); applyView() } else fitView();
}

const FS_ICON = {
    on: '<path d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4"/>',
    off: '<path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/>'
};
function drawFsBtn() {
    const b = $("#zfs"), on = fsOn();
    b.setAttribute("aria-pressed", on);
    b.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${on ? FS_ICON.on : FS_ICON.off}</svg><span>${t(on ? "fs.exit" : "fs.enter")}</span>`;
}
function setFS(on) {
    const c = $("#v-diag");
    c.classList.toggle("fs", on); document.body.classList.toggle("fsm", on);
    if (on && c.requestFullscreen) { const p = c.requestFullscreen(); if (p && p.catch) p.catch(() => { }) }
    if (!on && document.fullscreenElement) { const p = document.exitFullscreen(); if (p && p.catch) p.catch(() => { }) }
    VW.auto = true; drawFsBtn(); requestAnimationFrame(() => requestAnimationFrame(render));
}

/* ---------- init ---------- */
/* ---------- Paradox-style tooltips: hover (or long-press / keyboard focus) on any [data-tip] ---------- */
const tip = document.createElement("div"); tip.id = "tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true; document.body.appendChild(tip);
const E = x => String(x).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const tk = k => T[LANG][k] != null ? T[LANG][k] : (T.en[k] != null ? T.en[k] : "");
let tt, th;
function tipHide() { clearTimeout(tt); clearTimeout(th); tip.hidden = true }
function tipShow(el) {
    if (!el.isConnected) return;
    const p = el.dataset.tip.split("|"), h = p.length > 1 ? p.pop() : "";
    tip.innerHTML = (el.dataset.ttl ? `<b>${el.dataset.ttl}</b>` : "") + p.map(x => `<p>${x}</p>`).join("") + (h ? `<p class="tipx">💡 ${h}</p>` : "");
    tip.hidden = false;
    const w = tip.offsetWidth, hh = tip.offsetHeight, r = el.getBoundingClientRect(), below = r.bottom + 8;
    tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + "px";
    tip.style.top = (below + hh > innerHeight ? Math.max(8, r.top - hh - 8) : below) + "px";
}
document.addEventListener("pointerover", e => { const el = e.target.closest("[data-tip]"); if (!el || !el.dataset.tip) return; clearTimeout(tt); tt = setTimeout(() => tipShow(el), 450) });
document.addEventListener("pointerout", e => { if (!e.target.closest("[data-tip]")) return; if (e.pointerType == "mouse") tipHide(); else { clearTimeout(tt); clearTimeout(th); th = setTimeout(tipHide, 4000) } });
document.addEventListener("pointerdown", e => { if (e.pointerType == "mouse") tipHide() });
document.addEventListener("focusin", e => { const el = e.target.closest("[data-tip]"); if (el && el.dataset.tip && e.target.matches(":focus-visible")) tipShow(el) });
document.addEventListener("focusout", tipHide);
addEventListener("scroll", tipHide, true);
function closePick() { document.body.classList.remove("pk") }
function init() {
    applyI18n(); load();
    $("#tabs").onclick = e => { const b = e.target.closest(".gtab"); if (!b) return; cat = b.dataset.k; drawPick() };
    $("#q").oninput = e => { q = e.target.value.trim().toLowerCase(); drawPick() };
    $("#pick").onclick = e => { const b = e.target.closest(".pick"); if (!b) return; sel = b.dataset.id; path = []; ex = null; closePick(); render() };
    $("#chg").onclick = () => { document.body.classList.add("pk"); setTimeout(() => $("#q").focus(), 0) };
    $("#pkclose").onclick = closePick;
    addEventListener("keydown", e => { if (e.key == "Escape") { if (POP) { const b = POP.btn; closePop(); b.focus(); return } closePick(); if (fsOn() && !document.fullscreenElement) setFS(false) } });
    document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && fsOn()) setFS(false) });
    $("#mach").onclick = e => { const b = e.target.closest("[data-k][data-v]"); if (!b) return; S[b.dataset.k] = isNaN(b.dataset.v) ? b.dataset.v : +b.dataset.v; render() };
    document.addEventListener("click", e => {
        const cb = e.target.closest("[data-combo]"); if (cb) { if (POP && POP.btn == cb) closePop(); else openCombo(cb); return }
        const pk = e.target.closest("[data-pick]"); if (pk) { if (POP && POP.btn == pk) closePop(); else openPop(pk); return }
        const cv = e.target.closest(".cpop button[data-cv]"); if (cv && POP) { comboPick(cv); return }
        const m = e.target.closest(".mpop [data-m]"); if (m && POP) { if (m.getAttribute("aria-disabled")) return; S[POP.key] = m.dataset.m; closePop(); render(); return }
        if (POP && !e.target.closest(".mpop,.cpop")) closePop();
        if (document.body.classList.contains("pk") && e.target.isConnected && !e.target.closest("#picker,#chg")) closePick()
    });
    document.addEventListener("change", e => { const c = e.target.closest && e.target.closest(".cnt"); if (c) setMachines(c.dataset.sid, parseFloat(c.value)) });
    document.addEventListener("keydown", e => { if (e.key == "Enter" && e.target.classList && e.target.classList.contains("cnt")) e.target.blur() });
    const lg = $("#lang"); lg.innerHTML = Object.entries(LANGS).map(([k, v]) => `<option value="${k}">${v}</option>`).join(""); lg.value = LANG; lg.onchange = () => { try { localStorage.setItem("frc-lang", lg.value) } catch (_) { } location.reload() };
    addEventListener("resize", closePop);
    document.addEventListener("change", e => { if (POP && POP.combo && e.target.matches("[data-cv],[data-all]")) comboPick(e.target) });
    $("#mach").addEventListener("input", e => { const n = e.target.closest("[data-num]"); if (n) { S.bn = Math.max(0, Math.min(64, Math.floor(+n.value || 0))); render(true) } });
    $("#presets").innerHTML = Object.keys(PRE).map(n => `<button class="btn" data-p="${n}">${t("preset." + n)}</button>`).join("");
    $("#presets").onclick = e => { const b = e.target.closest(".btn"); if (!b) return; Object.assign(S, PRE[b.dataset.p], { loc: PRE[b.dataset.p].loc.slice() }); render() };
    $("#rate").oninput = () => { ex = null; render() };
    $("#unit").onchange = () => { if (ex != null) setRate(ex); render() };
    $("#diag").onclick = e => { const g = e.target.closest(".nd"); if (g && g.getAttribute("role") == "button") drill(g.dataset.i) };
    $("#diag").onkeydown = e => { if (e.key == "Enter" || e.key == " ") { const g = e.target.closest(".nd"); if (g && g.getAttribute("role") == "button") { e.preventDefault(); drill(g.dataset.i) } } };
    $("#crumbs").onclick = e => { const b = e.target.closest(".btn"); if (!b) return; const i = +b.dataset.i, p = path[i]; sel = p.n; path = path.slice(0, i); setRate(p.r); render() };
    $("#views").onclick = e => { const b = e.target.closest(".btn"); if (!b) return; view = b.dataset.v; showView(); render(true) };
    $("#zi").onclick = () => zoomCenter(1.3);
    $("#zo").onclick = () => zoomCenter(1 / 1.3);
    $("#zf").onclick = () => fitView();
    initPanZoom();
    $("#zfs").onclick = () => setFS(!fsOn());
    let tm; addEventListener("resize", () => { if (!small()) $("#cfg").open = true; clearTimeout(tm); tm = setTimeout(() => { if (VW.auto) fitView(); else { clampView(); applyView() } }, 150) });
    $("#cfg").open = !small();
    drawFsBtn(); showView(); render();
}
init();
