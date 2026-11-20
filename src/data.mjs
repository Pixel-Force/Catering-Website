// Single source of content for the Marigold & Thyme demo (fictional UK catering company, Birmingham).
// build.mjs renders every page from this file and writes assets/js/data.js for the browser
// (menu builder, allergen matrix, quote wizard, office lunch ordering, planner, search).
// Phone numbers are Ofcom drama numbers; every name, price, figure and review is fictional sample content.

export const BRAND = {
  name: "Marigold & Thyme",
  short: "Marigold & Thyme",
  tagline: "Catering & events",
  phone: "0121 496 0412",
  tel: "+441214960412",
  whatsapp: "447700900412",
  email: "hello@marigoldandthyme.co.uk",
  address: "Unit 4, Kiln Yard, Birmingham B18 6NE",
  street: "Unit 4, Kiln Yard",
  city: "Birmingham",
  postcode: "B18 6NE",
  hours: "Mon–Fri 9:00–18:00 · Sat 10:00–15:00 · tastings by appointment",
  since: 2012,
  area: "Birmingham, the West Midlands, Warwickshire, the Cotswolds and London",
};

export const STATS = [
  [3400, "", "+", "Events catered since 2012"],
  [96, "", "%", "Clients who would book us again"],
  [5, "", "/5", "Food hygiene rating"],
  [40, "", " miles", "Delivery radius from our kitchen"],
];

// Service pages. `from` = sample starting price per guest for the demo.
export const SERVICES = [
  { id: "wedding-catering", icon: "rings", img: "wedding-table", title: "Wedding catering", cat: "Weddings", from: 38,
    short: "Canapés, wedding breakfasts, sharing feasts and evening food for 40 to 600 guests, including mehndi and walima menus.",
    lead: "Wedding catering from Marigold & Thyme covers everything from the drinks-reception canapés to the late-night bacon rolls: one menu designer, a tasting for two, and a front-of-house team who keep the day on time.",
    points: ["Menu tasting for two included from 80 guests", "British, South Asian, Mediterranean and fusion menus", "Halal kitchen options, separate vegetarian prep", "Waiting staff, bar team and cake cutting", "Crockery, glassware and linen hire arranged"],
    who: "Couples and families planning civil, religious and multi-day weddings, including mehndi, nikah and walima.", lead_time: "Book 9–15 months ahead for Saturdays May–September." },
  { id: "corporate-catering", icon: "building", img: "banquet", title: "Corporate & conference catering", cat: "Corporate", from: 18,
    short: "Working lunches, conference days, client dinners, awards nights and staff parties, invoiced on account.",
    lead: "Corporate catering for offices, conferences and venues across the West Midlands: breakfast to evening reception, with clear allergen labels, on-time delivery windows and one account manager for every booking.",
    points: ["Conference day packages with breakfast, lunch and breaks", "Fully labelled food: 14 allergens on every item", "Monthly invoicing and PO numbers for account clients", "Plated dinners and awards nights for up to 600", "Eco packaging and zero-waste-to-landfill policy"],
    who: "Offices, event agencies, universities, venues and conference organisers.", lead_time: "48 hours for office lunches; 4–8 weeks for conferences." },
  { id: "private-dining", icon: "chef", img: "dinner-party", title: "Private chef & dinner parties", cat: "Private", from: 65,
    short: "A private chef in your home or a hired space: tasting menus, family-style feasts and birthday dinners for 6 to 40.",
    lead: "Our private chef service brings a restaurant-quality dinner to your own table. We plan the menu with you, shop, cook in your kitchen, serve and leave it spotless.",
    points: ["Four- to seven-course tasting menus", "Wine pairing suggestions from our sommelier", "Chef and server, all crockery if needed", "Cookery demonstrations at the table", "Kitchen left clean and tidy"],
    who: "Hosts celebrating at home, in a holiday house or a private room.", lead_time: "2–6 weeks ahead." },
  { id: "celebration-catering", icon: "cake", img: "party-hall", title: "Parties & celebrations", cat: "Parties", from: 24,
    short: "Birthdays, anniversaries, Eid and Diwali gatherings, christenings and wakes, with buffets, sharing platters or live stations.",
    lead: "Celebration catering for 30 to 400 guests: family-style buffets, live cooking stations and dessert tables, delivered and set up so the host can enjoy the party.",
    points: ["Buffets, sharing platters and live cooking stations", "Kids' menus and dessert tables", "Celebration cakes from our pastry kitchen", "Drop-off or fully staffed service", "Hall and marquee catering with mobile kitchen"],
    who: "Families and community groups planning parties at home, in halls, marquees and venues.", lead_time: "2–8 weeks ahead." },
  { id: "bbq-outdoor-catering", icon: "flame", img: "skewers", title: "BBQ, live grill & outdoor events", cat: "Outdoor", from: 26,
    short: "Charcoal grills, tandoor and pizza ovens for garden parties, summer staff days, festivals and sports events.",
    lead: "BBQ and outdoor catering with chefs cooking live over charcoal, a clay tandoor or a wood-fired oven. We bring the kitchen, power, gazebos and waste stations, so all you need is the space.",
    points: ["Charcoal grill, tandoor and wood-fired pizza", "Self-contained mobile kitchen and gazebos", "Food safety plan and risk assessment supplied", "Street-food stalls for festivals and fun days", "Wet-weather plan for every booking"],
    who: "Garden parties, company summer days, schools, sports clubs and festivals.", lead_time: "3–10 weeks ahead in summer." },
  { id: "buffet-grazing-tables", icon: "platter", img: "grazing", title: "Buffets & grazing tables", cat: "Buffets", from: 16,
    short: "Hot and cold buffets, grazing tables and canapé platters, delivered ready to serve or styled on site.",
    lead: "Buffets and grazing tables for 20 to 500 guests: seasonal salads, hot dishes kept at temperature, British cheeses and cured meats, styled with fresh flowers and herbs.",
    points: ["Grazing tables styled on site in 60–90 minutes", "Hot buffets with chafing dishes and a server", "Platters delivered in compostable trays", "Clear labels: vegan, vegetarian, halal and allergens", "Leftovers boxed for you or donated"],
    who: "Launches, open days, funerals, birthdays, Christenings and office celebrations.", lead_time: "48 hours for platters; 1–3 weeks for styled tables." },
];

// 14 UK allergens (Food Information Regulations).
export const ALLERGENS = [
  ["celery", "Celery"], ["gluten", "Cereals with gluten"], ["crustaceans", "Crustaceans"], ["eggs", "Eggs"], ["fish", "Fish"], ["lupin", "Lupin"], ["milk", "Milk"],
  ["molluscs", "Molluscs"], ["mustard", "Mustard"], ["nuts", "Tree nuts"], ["peanuts", "Peanuts"], ["sesame", "Sesame"], ["soya", "Soya"], ["sulphites", "Sulphites"],
];
export const DIETS = [["v", "Vegetarian"], ["vg", "Vegan"], ["h", "Halal"], ["gf", "Gluten-free"], ["df", "Dairy-free"]];
export const COURSES = [["canape", "Canapés"], ["starter", "Starters"], ["main", "Mains"], ["side", "Sides & rice"], ["dessert", "Desserts"], ["drink", "Drinks"]];

// Menu (menu builder + allergen matrix). sup = supplement per guest in £ on top of the package price.
export const DISHES = [
  { id: "beetroot-tartlet", c: "canape", n: "Beetroot & whipped feta tartlet", d: "Roast beetroot, feta, honey, thyme", diet: ["v", "h"], al: ["gluten", "milk", "eggs"], sup: 0 },
  { id: "chicken-tikka-bite", c: "canape", n: "Chicken tikka bites", d: "Charred chicken, mint yoghurt, pickled onion", diet: ["h", "gf"], al: ["milk", "mustard"], sup: 0, img: "tikka" },
  { id: "mini-samosa", c: "canape", n: "Mini vegetable samosas", d: "Spiced potato and pea, tamarind chutney", diet: ["v", "vg", "h", "df"], al: ["gluten", "mustard"], sup: 0, img: "samosa" },
  { id: "smoked-salmon-blini", c: "canape", n: "Smoked salmon blini", d: "Crème fraîche, dill, lemon", diet: [], al: ["fish", "gluten", "milk", "eggs"], sup: 1.5 },
  { id: "prawn-skewer", c: "canape", n: "Chilli & lime king prawn skewers", d: "Garlic, coriander, lime", diet: ["gf", "df"], al: ["crustaceans"], sup: 2 },
  { id: "arancini", c: "canape", n: "Wild mushroom arancini", d: "Truffle mayonnaise, parmesan", diet: ["v"], al: ["gluten", "milk", "eggs", "celery"], sup: 1 },
  { id: "lamb-kofta", c: "starter", n: "Lamb kofta, smoked aubergine", d: "Pomegranate, herbs, flatbread", diet: ["h"], al: ["gluten", "sesame", "milk"], sup: 1, img: "grill-platter" },
  { id: "burrata", c: "starter", n: "Burrata, heritage tomatoes", d: "Basil oil, sourdough crumb", diet: ["v"], al: ["milk", "gluten"], sup: 2 },
  { id: "chaat", c: "starter", n: "Aloo tikki chaat", d: "Potato cakes, chickpeas, yoghurt, chutneys", diet: ["v", "h", "gf"], al: ["milk"], sup: 0 },
  { id: "salmon-gravlax", c: "starter", n: "Beetroot-cured salmon", d: "Horseradish, rye, cucumber", diet: [], al: ["fish", "gluten", "milk", "mustard"], sup: 2 },
  { id: "squash-soup", c: "starter", n: "Roast squash & coconut soup", d: "Chilli oil, toasted seeds", diet: ["v", "vg", "h", "gf", "df"], al: ["celery"], sup: 0 },
  { id: "chicken-supreme", c: "main", n: "Chicken supreme, wild garlic", d: "Dauphinoise potatoes, greens, thyme jus", diet: ["h", "gf"], al: ["milk", "celery", "sulphites"], sup: 0 },
  { id: "lamb-rump", c: "main", n: "Lamb rump, minted pea purée", d: "Fondant potato, red wine sauce", diet: ["h", "gf"], al: ["milk", "celery", "sulphites"], sup: 5, img: "lamb" },
  { id: "beef-fillet", c: "main", n: "Fillet of beef, peppercorn sauce", d: "Triple-cooked chips, roast tomato", diet: ["h", "gf"], al: ["milk", "sulphites"], sup: 9, img: "steak" },
  { id: "salmon-fillet", c: "main", n: "Salmon, salsa verde", d: "New potatoes, samphire, lemon", diet: ["gf", "df"], al: ["fish", "mustard"], sup: 3, img: "salmon" },
  { id: "butter-chicken", c: "main", n: "Butter chicken", d: "Slow-cooked in tomato, cream and fenugreek", diet: ["h", "gf"], al: ["milk", "nuts"], sup: 0, img: "butter-chicken" },
  { id: "lamb-biryani", c: "main", n: "Lamb dum biryani", d: "Saffron rice, crispy onions, raita", diet: ["h"], al: ["milk", "nuts"], sup: 2, img: "biryani-2" },
  { id: "chicken-biryani", c: "main", n: "Chicken biryani", d: "Hyderabadi-style, mint and fried onion", diet: ["h", "gf"], al: ["milk"], sup: 0, img: "biryani" },
  { id: "paneer-makhani", c: "main", n: "Paneer makhani", d: "Tomato, butter, kasuri methi", diet: ["v", "h", "gf"], al: ["milk", "nuts"], sup: 0, img: "paneer" },
  { id: "chana-masala", c: "main", n: "Chana masala & spinach", d: "Chickpeas, ginger, garam masala", diet: ["v", "vg", "h", "gf", "df"], al: [], sup: 0, img: "curry" },
  { id: "wellington", c: "main", n: "Mushroom & chestnut wellington", d: "Red onion gravy, roast roots", diet: ["v", "vg", "h", "df"], al: ["gluten", "celery", "sulphites", "nuts"], sup: 1 },
  { id: "paella", c: "main", n: "Seafood & chorizo paella", d: "Cooked live in a 90 cm pan", diet: ["gf", "df"], al: ["crustaceans", "molluscs", "fish", "celery"], sup: 3, img: "paella" },
  { id: "pilau", c: "side", n: "Saffron pilau rice", d: "Whole spices, cardamom", diet: ["v", "vg", "h", "gf", "df"], al: [], sup: 0, img: "thali" },
  { id: "naan", c: "side", n: "Garlic & coriander naan", d: "Baked in the tandoor", diet: ["v", "h"], al: ["gluten", "milk", "eggs"], sup: 0 },
  { id: "potatoes", c: "side", n: "Rosemary roast potatoes", d: "Sea salt, garlic", diet: ["v", "vg", "h", "gf", "df"], al: [], sup: 0 },
  { id: "greens", c: "side", n: "Seasonal greens", d: "Lemon, olive oil, almonds", diet: ["v", "vg", "h", "gf", "df"], al: ["nuts"], sup: 0, img: "veg-prep" },
  { id: "salad-bowl", c: "side", n: "Chickpea, avocado & herb salad", d: "Sumac dressing", diet: ["v", "vg", "h", "gf", "df"], al: ["sesame"], sup: 0, img: "salad" },
  { id: "pasta-salad", c: "side", n: "Pesto pasta salad", d: "Sun-dried tomato, rocket, parmesan", diet: ["v"], al: ["gluten", "milk", "nuts", "eggs"], sup: 0, img: "pasta-salad" },
  { id: "lemon-tart", c: "dessert", n: "Lemon meringue tart", d: "Torched meringue, raspberry", diet: ["v", "h"], al: ["gluten", "milk", "eggs"], sup: 0, img: "tart" },
  { id: "panna-cotta", c: "dessert", n: "Vanilla panna cotta", d: "Strawberries, shortbread", diet: ["h"], al: ["milk", "gluten"], sup: 0, img: "desserts" },
  { id: "chocolate-torte", c: "dessert", n: "Dark chocolate torte", d: "Salted caramel, crème fraîche", diet: ["v", "h", "gf"], al: ["milk", "eggs"], sup: 1, img: "choc-cake" },
  { id: "gulab-jamun", c: "dessert", n: "Gulab jamun & kulfi", d: "Rose syrup, pistachio", diet: ["v", "h"], al: ["milk", "nuts", "gluten"], sup: 1 },
  { id: "mango-sorbet", c: "dessert", n: "Alphonso mango sorbet", d: "Lime and mint", diet: ["v", "vg", "h", "gf", "df"], al: [], sup: 0 },
  { id: "mint-lemonade", c: "drink", n: "Mint & lime cooler", d: "Fresh mint, lime, soda", diet: ["v", "vg", "h", "gf", "df"], al: [], sup: 2, img: "mojito" },
  { id: "mango-lassi", c: "drink", n: "Mango lassi", d: "Yoghurt, cardamom", diet: ["v", "h", "gf"], al: ["milk"], sup: 2 },
  { id: "fizz", c: "drink", n: "Glass of English sparkling wine", d: "On arrival or for the toast", diet: ["v", "vg", "gf", "df"], al: ["sulphites"], sup: 8, img: "wine" },
];

// Price model (quick quote, packages, quote wizard). Typical sample prices, before VAT.
export const PRICING = {
  styles: [
    { id: "canapes", n: "Canapé reception", pp: 24, d: "8 canapés and 2 bowl food items per guest", servePer: 20 },
    { id: "buffet", n: "Buffet feast", pp: 32, d: "2 mains, 4 sides and salads, 2 desserts", servePer: 25 },
    { id: "sharing", n: "Sharing banquet", pp: 44, d: "Platters to the table, 3 courses", servePer: 16 },
    { id: "plated", n: "Plated 3 courses", pp: 62, d: "Starter, main and dessert served to each guest", servePer: 12 },
  ],
  types: { wedding: { n: "Wedding", k: 1.1 }, corporate: { n: "Corporate event", k: 1 }, party: { n: "Party or celebration", k: 0.95 }, private: { n: "Private dinner", k: 1.3 }, outdoor: { n: "BBQ or outdoor event", k: 0.92 } },
  extras: [
    { id: "bar", n: "Bar service & soft drinks", pp: 12 },
    { id: "dessert", n: "Dessert table", pp: 6 },
    { id: "late", n: "Late-night food", pp: 5 },
    { id: "hire", n: "Crockery, glassware & linen", pp: 4.5 },
    { id: "cake", n: "Celebration cake", flat: 380 },
    { id: "live", n: "Live cooking station", flat: 450 },
  ],
  staffRate: 22, staffHours: 6, chefPer: 60, delivery: 95, vat: 0.2, minGuests: 20,
};

export const PACKAGES = {
  Weddings: [
    { n: "Garden", pp: 42, best: false, d: "Relaxed and generous", items: ["4 canapés on arrival", "Sharing feast: 2 mains, 4 sides", "Dessert platters to the table", "Front-of-house team", "Tasting for two"] },
    { n: "Marigold", pp: 64, best: true, d: "Our most booked wedding menu", items: ["6 canapés on arrival", "Plated 3-course wedding breakfast", "Evening food for all guests", "Front-of-house and bar team", "Tasting for four, menu cards printed"] },
    { n: "Banquet", pp: 85, best: false, d: "Multi-course and live stations", items: ["8 canapés and 2 bowl foods", "Starter, live biryani or carving station, dessert", "Dessert table and late-night food", "Full staffing and toastmaster liaison", "Two tastings, crockery and linen hire"] },
  ],
  Corporate: [
    { n: "Working lunch", pp: 14, best: false, d: "Delivered, no staff needed", items: ["Sandwiches, wraps and a salad", "Seasonal fruit and a sweet", "Compostable platters", "Allergen labels on every item", "Minimum 10 guests"] },
    { n: "Conference day", pp: 38, best: true, d: "Breakfast to afternoon tea", items: ["Arrival coffee and pastries", "Hot fork buffet lunch", "Two refreshment breaks", "Event staff all day", "Monthly invoicing"] },
    { n: "Client dinner", pp: 72, best: false, d: "Plated, with wine service", items: ["3 canapés with fizz", "Plated 3-course dinner", "Wine and soft drinks service", "Menu cards and place names", "Dedicated event manager"] },
  ],
  Parties: [
    { n: "Drop-off", pp: 16, best: false, d: "Platters delivered ready", items: ["Hot or cold buffet platters", "Disposable or hired serveware", "Delivery and set-up", "Labels for diets and allergens", "Minimum 20 guests"] },
    { n: "Feast", pp: 32, best: true, d: "Hot buffet with a server", items: ["2 mains, rice, breads, 3 sides", "Starter platters", "Dessert", "1 server per 25 guests", "Chafing dishes and clear-down"] },
    { n: "Live", pp: 46, best: false, d: "Chefs cooking in front of guests", items: ["Live grill or tandoor station", "Street-food style starters", "Dessert table", "Full staffing", "Mobile kitchen if the venue has none"] },
  ],
};

// Office lunch ordering (order online, delivered).
export const LUNCH = [
  { id: "sandwich-platter", n: "Classic sandwich platter", d: "12 halves on artisan bread, 2 vegetarian options", serves: 6, price: 42, diet: ["v"], img: "brunch" },
  { id: "wrap-platter", n: "Wrap & flatbread platter", d: "Chicken shawarma, falafel, halloumi", serves: 6, price: 46, diet: ["h"], img: "spread" },
  { id: "grain-bowls", n: "Grain bowls (each)", d: "Salmon, chicken or roast squash; dressed separately", serves: 1, price: 9.5, diet: ["gf"], img: "bowl" },
  { id: "salad-bowl-large", n: "Large salad bowl", d: "Chickpea, avocado, herbs, sumac", serves: 8, price: 34, diet: ["vg", "gf"], img: "salad" },
  { id: "hot-curry", n: "Hot curry lunch", d: "Butter chicken, chana masala, pilau, naan", serves: 10, price: 125, diet: ["h"], img: "butter-chicken" },
  { id: "samosa-box", n: "Samosa & pakora box", d: "24 pieces with chutneys", serves: 8, price: 36, diet: ["vg", "h"], img: "samosa" },
  { id: "fruit-platter", n: "Seasonal fruit platter", d: "Cut fruit, mint", serves: 10, price: 30, diet: ["vg", "gf"], img: "produce" },
  { id: "cookie-box", n: "Cookie & brownie box", d: "18 pieces, baked this morning", serves: 9, price: 27, diet: ["v"], img: "cookies" },
  { id: "breakfast", n: "Breakfast pastries & coffee", d: "Pastries, granola pots, coffee for 10", serves: 10, price: 65, diet: ["v"], img: "coffee" },
];
export const LUNCH_RULES = { min: 120, delivery: 12, freeOver: 300, areas: ["B", "CV", "WS", "WV", "DY", "B9"], slots: ["07:30", "08:30", "11:30", "12:00", "12:30", "13:00"] };

export const PROCESS = [
  ["Tell us about the event", "Two minutes online or a quick call. You get a typical per-guest price straight away."],
  ["Get a costed proposal", "Within two working days: menu, staffing, timings and a line-by-line price."],
  ["Taste it", "Weddings and large events get a tasting at our Birmingham kitchen to fine-tune every dish."],
  ["We cook, serve and clear", "Our chefs cook fresh on the day, the front-of-house team serves, and we leave the venue clean."],
];

export const TEAM = [
  { id: "imran-siddiqui", img: "team-1", name: "Imran Siddiqui", role: "Executive chef & co-founder", bio: "Trained in hotel kitchens in Hyderabad and London before opening Marigold & Thyme with Eleanor in 2012. Writes every menu and still cooks at most weddings." },
  { id: "eleanor-hart", img: "team-2", name: "Eleanor Hart", role: "Co-founder & events director", bio: "Fifteen years running hospitality for Midlands venues. Plans the logistics, staffing and timings so the food arrives at its best." },
  { id: "tomasz-nowak", img: "team-3", name: "Tomasz Nowak", role: "Head of pastry", bio: "Wedding cakes, dessert tables and the cookies everyone asks about. Specialist in egg-free and gluten-free baking." },
  { id: "grace-adeyemi", img: "team-4", name: "Grace Adeyemi", role: "Weddings & private events manager", bio: "Your contact from the first tasting to the last dance. Known for calm, clear timelines and great seating-plan advice." },
  { id: "sam-okafor", img: "team-5", name: "Sam Okafor", role: "Corporate catering lead", bio: "Looks after office, conference and venue accounts, from daily lunches to 600-guest awards dinners." },
];

export const REVIEWS = [
  ["Our walima for 380 guests ran perfectly. The lamb biryani was the best our families have had, and the team handled two separate menus without a single mix-up.", "Ayesha & Bilal", "Wedding, Edgbaston", 5],
  ["They catered our three-day conference: every lunch labelled, every coffee break on time, and the vegan options were genuinely popular.", "Kirsty Lane", "Events manager, conference organiser", 5],
  ["Imran cooked a seven-course dinner for my mum's 70th in our kitchen. It felt like a restaurant, and he left the place cleaner than he found it.", "Daniel Price", "Private dinner, Solihull", 5],
  ["The grazing table was a showstopper at our launch. Guests took photos before they ate anything.", "Priya Mistry", "Brand launch, Jewellery Quarter", 5],
  ["Booked the live grill for our staff summer day: 220 people fed in under an hour and the halloumi skewers ran out first.", "Mark Edwards", "Summer staff party, Coventry", 5],
  ["Our son has a nut allergy and they prepared a separate plate, labelled and served first. That care meant a lot.", "Hannah Collins", "Christening, Warwick", 5],
];

export const FAQ = [
  ["Prices", "How much does catering cost per person in the UK?", "As a guide, a drop-off buffet starts at about £16 per guest, a staffed hot buffet at £32, a sharing banquet at £44 and a plated three-course meal at £62, before VAT. Staff, drinks, hire and travel are added. Use the quick quote on our homepage for a typical figure for your event."],
  ["Prices", "Is there a minimum number of guests?", "Staffed events start at 20 guests and office lunch orders at £120. Private chef dinners start at 6 guests."],
  ["Prices", "Do your prices include VAT and staff?", "Package prices are per guest before VAT. Packages that say 'staffed' include the team; otherwise staff are £22 an hour each, with a 6-hour minimum. Your proposal lists every line."],
  ["Prices", "What deposit do you need?", "25% to confirm your date, 50% eight weeks before the event and the balance 14 days before. Final guest numbers are due 14 days before."],
  ["Menus", "Can you cater for halal, vegan and other diets?", "Yes. We cook halal meat from HMC-certified suppliers, and vegetarian and vegan dishes are prepared separately. Every dish on our menu is labelled with its diets and the 14 allergens."],
  ["Menus", "How do you handle allergies?", "Tell us about allergies when you book. We label every dish with the 14 UK allergens, prepare allergy meals separately, label them with the guest's name and serve them first. Our kitchen handles nuts and gluten, so we cannot promise a dish is free from traces."],
  ["Menus", "Can we have a tasting?", "Yes. Weddings from 80 guests include a tasting for two at our Birmingham kitchen. Other tastings are £45 per person, deducted from your final invoice if you book."],
  ["Menus", "Can you mix cuisines, for example British and South Asian?", "Most of our weddings do. A common choice is canapés and a British starter, then a South Asian main course, with a dessert table that suits both families."],
  ["On the day", "How many staff will we need?", "As a rule of thumb, one server per 12 guests for plated food, one per 16 for sharing platters and one per 25 for a buffet, plus one chef per 60 guests. Our planner works this out for you."],
  ["On the day", "Do you need a kitchen at the venue?", "No. We bring a mobile kitchen, ovens and hot cupboards where needed. We visit or call the venue before the event to plan power, water and access."],
  ["On the day", "Do you provide crockery, glassware and linen?", "Yes, through our hire partners. It's priced per guest in your proposal, and we collect it dirty, so there is no washing up."],
  ["On the day", "What happens to leftover food?", "Where food safety allows, we box leftovers for you or donate them through a local food charity. Food waste goes to anaerobic digestion, never to landfill."],
  ["Booking", "How far ahead should we book?", "9–15 months for a summer Saturday wedding, 4–8 weeks for corporate and party events, and 48 hours for office lunches. Ask anyway if it's sooner: we often have weekday availability."],
  ["Booking", "Which areas do you cover?", "Birmingham, the West Midlands, Warwickshire, Worcestershire and the Cotswolds as standard, and London and the rest of England for larger events. Office lunch delivery covers B, CV, WS, WV and DY postcodes."],
];

export const GALLERY = [
  ["bouquet", "Weddings", "Bridal bouquet at a summer wedding"], ["wedding-table", "Weddings", "Greenery table for a garden wedding"], ["wedding-cake", "Weddings", "Three-tier cake from our pastry kitchen"],
  ["long-table", "Weddings", "Candlelit long tables for a winter wedding"], ["banquet", "Corporate", "Awards dinner for 400"], ["conference", "Corporate", "Conference day catering"],
  ["guests", "Parties", "Sharing feast at a 40th birthday"], ["party-hall", "Parties", "Christening lunch in a village hall"], ["outdoor-feast", "Outdoor", "Garden party seen from above"],
  ["skewers", "Outdoor", "Live charcoal grill"], ["chef-flame", "Outdoor", "Chef cooking over flame"], ["grazing", "Food", "British grazing board"],
  ["biryani-2", "Food", "Lamb dum biryani"], ["salmon", "Food", "Salmon with salsa verde"], ["desserts", "Food", "Vanilla panna cotta"],
  ["chef-copper", "Food", "Plating the wedding breakfast"], ["garden-lunch", "Outdoor", "Long lunch in the garden"], ["cocktail", "Parties", "Signature drinks"],
];

export const POSTS = [
  { id: "how-much-food-per-guest", title: "How much food do you need per guest? A UK caterer's guide", date: "2026-10-14", cat: "Planning", img: "spread", author: "Imran Siddiqui",
    ex: "Canapés, buffet portions, rice and bread per guest: the quantities we use for 3,400 events, with a calculator." },
  { id: "wedding-catering-cost-uk", title: "Wedding catering costs in the UK in 2026", date: "2026-09-02", cat: "Weddings", img: "wedding-table", author: "Grace Adeyemi",
    ex: "What a wedding caterer charges per head, what's included and where couples can save without guests noticing." },
  { id: "allergens-and-catering", title: "Allergens and event catering: what your caterer must tell you", date: "2026-07-21", cat: "Food safety", img: "prep", author: "Eleanor Hart",
    ex: "The 14 allergens, how labelling works at buffets and weddings, and the questions to ask before you book." },
];
