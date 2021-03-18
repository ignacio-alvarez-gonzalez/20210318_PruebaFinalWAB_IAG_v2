define(['dojo/_base/declare', 'jimu/BaseWidget', "esri/layers/FeatureLayer", "esri/SpatialReference", "esri/tasks/QueryTask", "esri/tasks/query", "esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "dojo/_base/lang"], function (declare, BaseWidget, FeatureLayer, SpatialReference, QueryTask, Query, Graphic, SimpleFillSymbol, SimpleLineSymbol, Color, lang) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {

        // Custom widget code goes here

        baseClass: 'xunta-i-a-g',
        // this property is set by the framework when widget is loaded.
        // name: 'Xunta_IAG',
        // add additional properties here

        //methods to communication with app container:
        postCreate: function postCreate() {
            this.inherited(arguments);
            console.log('Xunta_IAG::postCreate');
        },

        // startup: function() {
        //   this.inherited(arguments);
        //   console.log('Xunta_IAG::startup');
        // },

        // onOpen: function(){
        //   console.log('Xunta_IAG::onOpen');
        // },


        // Defino la función que se lanza al hacer un cambio en el selector de provincias:
        cargaConcellos: function cargaConcellos() {

            // Guardo en una variable el codigo de la provincia indicada en el selector de provincias:
            var codigoProvincia = this.selectorProvincias.value;

            // Indico que si el valor de la variable es el correspondiente a no haber seleccionado ninguna, el código no continue:
            if (codigoProvincia == -1) return;

            // Si el código si que continua tras lo anterior, lo siguiente que hace es dejar la lista de opciones del selector vacía:
            this.selectorConcellos.innerHTML = "";

            // Creo y guardo en una variable una query task, que consultará la url de concellos almacenada en el archivo config:
            var tareaConsulta = new QueryTask(this.config.urlConcellos);

            // Creo y guardo en una variable la query para pasarle a la query task, a continuación defino sus parámetros:
            var consulta = new Query();
            // Indico que no me devuelva la geometía de los resultados, para guardarlos en el selector solo necesito los valores:
            consulta.returnGeometry = false;
            // Indico los campos que me tiene que devolver la consulta:
            consulta.outFields = ["CODCONC", "CONCELLO"];
            // Indico que me devuelva las entidades de la consulta ordenados por el nombre del concejo:
            consulta.orderByFields = ["CONCELLO"];
            // Indico el texto de la consulta, buscando todos las entidades dentro de los concejos cuyo código de provincia coincida con el indicado en el selector:
            consulta.where = "CODPROV = " + codigoProvincia;

            // Resuelvo la query task, con la query configurada, y lanzo la función a ejecutar cuando se complete:
            // Añado lang.hitch para mantener el entorno de la función anterior y poder llamar elementos con this:
            tareaConsulta.execute(consulta, lang.hitch(this, function (resultados) {

                console.log("Los resultados: ", resultados);

                // Añado en el selector de concellos la opción por defecto:

                // Creo y guardo en una variable un elemento html de tipo option:
                var opcion = document.createElement("option");
                // Indico el valor del elemento option:
                opcion.value = -1;
                // Indico el texto que mostrará el elemento option:
                opcion.text = "Seleccione un concello:";
                // Añado el elemento option al select de concellos del html:
                this.selectorConcellos.add(opcion);

                // Itero por los resultados de la query task para agregarlos al select de concellos de forma similar a la opción por defecto:
                for (var i = 0; i < resultados.features.length; i++) {

                    opcion = document.createElement("option");
                    // Indico el valor a partir de las propiedades de los resultados, cogiendolo del campo de código del concello:
                    opcion.value = resultados.features[i].attributes.CODCONC;
                    // Indico el texto a partir de las propiedades de los resultados, cogiendolo del campo de nombre del concello:
                    opcion.text = resultados.features[i].attributes.CONCELLO;
                    this.selectorConcellos.add(opcion);
                }
            }));
        },


        // Defino la función que se lanza al hacer un cambio en el selector de concellos, que es similar a la anterior:
        cargaParroquias: function cargaParroquias() {

            var codigoConcello = this.selectorConcellos.value;

            if (codigoConcello == -1) return;

            this.selectorParroquias.innerHTML = "";

            var tareaConsulta = new QueryTask(this.config.urlParroquias);

            var consulta = new Query();
            consulta.returnGeometry = false;
            consulta.outFields = ["CODPARRO", "PARROQUIA"];
            consulta.orderByFields = ["PARROQUIA"];
            consulta.where = "CODCONC = " + codigoConcello;

            tareaConsulta.execute(consulta, lang.hitch(this, function (resultados) {

                console.log("Los resultados: ", resultados);

                var opcion = document.createElement("option");
                opcion.value = -1;
                opcion.text = "Seleccione una parroquia:";
                this.selectorParroquias.add(opcion);

                for (var i = 0; i < resultados.features.length; i++) {

                    opcion = document.createElement("option");
                    opcion.value = resultados.features[i].attributes.CODPARRO;
                    opcion.text = resultados.features[i].attributes.PARROQUIA;
                    this.selectorParroquias.add(opcion);
                }
            }));
        },


        // Defino la función que se lanza al pulsar en el botón de buscar concello:
        zoomConcello: function zoomConcello() {

            // Guardo en una variable el codigo del concello indicado en el selector de concellos:
            var codigoConcello = this.selectorConcellos.value;

            // Indico que si el valor de la variable es el correspondiente a la opción por defecto (no haber seleccionado ninguno), el código no continue:      
            if (codigoConcello == -1) return;

            // Creo y guardo en una variable una query task, que consultará la url de concellos almacenada en el archivo config:
            var tareaConsulta = new QueryTask(this.config.urlConcellos);

            // Creo y guardo en una variable la query para pasarle a la query task, a continuación defino sus parámetros:
            var consulta = new Query();
            // Indico que la consulta devuelva la geometía de los resultados, para usarlos para representar el polígono en el mapa:
            consulta.returnGeometry = true;
            // Indico los campos que me tiene que devolver la consulta:
            consulta.outFields = ["CODCONC", "CONCELLO"];
            // Indico que me devuelva las entidades de la consulta ordenados por el nombre del concejo:
            consulta.orderByFields = ["CONCELLO"];
            // Indico el texto de la consulta, buscando la entidad dentro de los concellos cuyo código oincida con el indicado en el selector de concellos:
            consulta.where = "CODCONC = " + codigoConcello;
            // Indico que la referencia espacial de los resultados sea igual a la del mapa base:
            consulta.outSpatialReference = new SpatialReference(102100);

            // Resuelvo la query task, con la query configurada, y lanzo la función a ejecutar cuando se complete:
            // Añado lang.hitch para mantener el entorno de la función anterior y poder llamar elementos con this:
            tareaConsulta.execute(consulta, lang.hitch(this, function (resultado) {

                console.log(resultado);

                // Indico a la función que solo dibuje el polígono devuelto por la consulta si la consulta ha devuelto algún elemento:
                if (resultado.features.length > 0) {

                    // Guardo en una variable la geometría del primer elemento de las entidades de los resultados de la consulta:
                    var geometria = resultado.features[0].geometry;
                    // Creo y guardo en una variable una simbología para el polígono que se va a dibujar:
                    var simbolo = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([0, 0, 0]), 2), new Color([0, 127, 255, 0.35]));

                    // Creo y guardo en una variable un nuevo gráfico con la geometría y el símbolo anteriores:
                    poligono = new Graphic(geometria, simbolo);

                    // Borro cualquier otro gráfico del mapa antes de añadir el nuevo:
                    this.map.graphics.clear();
                    // Añado el gráfico en la capa gráficos que tiene por defecto el mapa:
                    this.map.graphics.add(poligono);
                    // Centro el mapa en la extensión obtenida de la geometría del resultado:
                    this.map.setExtent(geometria.getExtent(), true);
                }
            }));
        },


        // Defino la función que se lanza al pulsar en el botón de buscar concello, que es similar a la anterior:
        zoomParroquia: function zoomParroquia() {

            var codigoParroquia = this.selectorParroquias.value;

            if (codigoParroquia == -1) return;

            var tareaConsulta = new QueryTask(this.config.urlParroquias);

            var consulta = new Query();
            consulta.returnGeometry = true;
            consulta.outFields = ["CODPARRO", "PARROQUIA"];
            consulta.orderByFields = ["PARROQUIA"];
            consulta.where = "CODPARRO = " + codigoParroquia;
            consulta.outSpatialReference = new SpatialReference(102100);

            tareaConsulta.execute(consulta, lang.hitch(this, function (resultado) {

                console.log(resultado);

                if (resultado.features.length > 0) {

                    var geometria = resultado.features[0].geometry;
                    var simbolo = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([0, 0, 0]), 2), new Color([0, 127, 255, 0.5]));

                    poligono = new Graphic(geometria, simbolo);

                    this.map.graphics.clear();
                    this.map.graphics.add(poligono);
                    this.map.setExtent(geometria.getExtent(), true);
                }
            }));
        },
        borrarSeleccion: function borrarSeleccion() {
            this.map.graphics.clear();
        }

        // onClose: function(){
        //   console.log('Xunta_IAG::onClose');
        // },

        // onMinimize: function(){
        //   console.log('Xunta_IAG::onMinimize');
        // },

        // onMaximize: function(){
        //   console.log('Xunta_IAG::onMaximize');
        // },

        // onSignIn: function(credential){
        //   console.log('Xunta_IAG::onSignIn', credential);
        // },

        // onSignOut: function(){
        //   console.log('Xunta_IAG::onSignOut');
        // }

        // onPositionChange: function(){
        //   console.log('Xunta_IAG::onPositionChange');
        // },

        // resize: function(){
        //   console.log('Xunta_IAG::resize');
        // }

        //methods to communication between widgets:

    });
});
//# sourceMappingURL=Widget.js.map
