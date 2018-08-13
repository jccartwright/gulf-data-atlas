var app;

require(["esri/Map",
    "esri/Basemap",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/widgets/Search",
    "esri/core/watchUtils",
    "dojo/query",

    // Calcite-maps
    "calcite-maps/calcitemaps-v0.8",
    "calcite-maps/calcitemaps-arcgis-support-v0.8",

    // Bootstrap
    "bootstrap/Collapse", 
    "bootstrap/Dropdown",
    "bootstrap/Tab",      

    "dojo/domReady!"
], function(Map, Basemap, MapView, SceneView, Search, watchUtils, query, CalciteMaps, CalciteMapsArcGIS) {
    
    // App
    app = {
    zoom: 1,
    center: [-40,40],
    basemap: "satellite",
    viewPadding: {
        top: 50, bottom: 0
    },
    uiPadding: {
        top: 15, bottom: 15
    },
    map: null,
    mapView: null,
    sceneView: null,
    activeView: null,
    searchWidgetNav: null,
    containerMap: "mapViewDiv",
    containerScene: "sceneViewDiv"
    };

    // Map 
    app.map = new Map({
    basemap: app.basemap,
    ground: "world-elevation"
    });

    // 2D View
    app.mapView = new MapView({
    container: app.containerMap, // activate
    map: app.map,
    padding: {
        top: 85
    },
    zooom: app.zoom,
    center: app.center,
    padding: app.viewPadding,
    ui: {
        components: ["zoom", "attribution"],
        padding: app.uiPadding
    }
    });

    // 3D View
    app.sceneView = new SceneView({
    container: null, // deactivate
    map: app.map,
    zoom: app.zoom,
    center: app.center,
    padding: app.viewPadding,
    ui: {
        padding: app.uiPadding
    }
    });

    // Active view is scene
//    setActiveView(app.sceneView);
    setActiveView(app.mapView);

    // Create search widget
    app.searchWidgetNav = new Search({
    container: "searchNavDiv",
    view: app.activeView
    });

    // Wire-up expand events
    CalciteMapsArcGIS.setSearchExpandEvents(app.searchWidgetNav);
    CalciteMapsArcGIS.setPopupPanelSync(app.mapView);
    CalciteMapsArcGIS.setPopupPanelSync(app.sceneView);

    // Menu UI - change Basemaps
    query("#selectBasemapPanel").on("change", function(e){
    app.mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
    app.sceneView.map.basemap = e.target.value;
    });  

    query(".calcite-navbar li a[data-toggle='menu']").on("click", function(e) {
        console.log(e.target.text);
    });


    // Tab UI - switch views
    query(".calcite-navbar li a[data-toggle='tab']").on("click", function(e) {
    if (e.target.text.indexOf("Map") > -1) {
        syncViews(app.sceneView, app.mapView);
        setActiveView(app.mapView);
    } else {
        syncViews(app.mapView, app.sceneView);
        setActiveView(app.sceneView);
    }
    syncSearch(app.activeView);
    }); 

    // Views
    function syncViews(fromView, toView) {
    var viewPt = fromView.viewpoint.clone();
    fromView.container = null;
    if (fromView.type === "3d") {          
        toView.container = app.containerMap;
    } else {
        toView.container = app.containerScene;
    }
    toView.viewpoint = viewPt;
    toView.padding = app.viewPadding;
    }

    // Search Widget
    function syncSearch(view) {
    app.searchWidgetNav.view = view;
    if (app.searchWidgetNav.selectedResult) {
        watchUtils.whenTrueOnce(view,"ready",function(){
        app.searchWidgetNav.autoSelect = false;
        app.searchWidgetNav.search(app.searchWidgetNav.selectedResult.name);
        app.searchWidgetNav.autoSelect = true;            
        });
    }
    }

    // Active view
    function setActiveView(view) {
        app.activeView = view;
    }

});
