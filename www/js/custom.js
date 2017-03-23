var _db = null;
var _user = null;
var _actualPage = null;
var _pageInfo = [];

$(document).ready(function(){
	//cada que se cargue la pagina
	//se toma el nombre de la pagina
	_actualPage = $("#page-name").val();
	//se cargan los datos de la sesion usuario
	_user = JSON.parse(sessionStorage.getItem("usuario"));
	//se obtiene el
	getConenido();
	buildMenu();
	buildPagina();	
	//console.log(getQueryString("hola"));
});

$(".salir").click(function(e){
	e.preventDefault();
	endSession();
});

$("#slct-categoria").on('change', function() {
  $("#map-viewer").prop("src", "maps/"+$(this).val()+".html");
});

$("#slct-historial").on('change', function() {
  $(".indicador-valor-pasado p").html($(this).val());
})

$("#slct-barrio").on('change', function() {
	$(".cont-detalle-barrio").html("");
	if ($(this).val() == "" ) {
		return;
	}
	var categoria = $("option:selected", this).data("categoria");
	var metas = $("option:selected", this).data("metas");
	var article = $("<article/>").prop("class", "row detalle-barrio");
	var indicador = $("<div/>").prop("class", "col-xs-6 der").html("<p><strong>Este año</strong></p>");
	var valor = $("<div/>").prop("class", "col-xs-6 izq").html("<p>"+metas[categoria]["actual"]+"</p>");
	article.append(indicador).append(valor);
	$(".cont-detalle-barrio").html(article);
	console.log(categoria);
	$.each(metas[categoria].historial,function(key, val){
		article = $("<article/>").prop("class", "row detalle-barrio");
		indicador = $("<div/>").prop("class", "col-xs-6 der").html("<p><strong>"+val.año+"</strong></p>");
		valor = $("<div/>").prop("class", "col-xs-6 izq").html("<p>"+val.valor+"</p>");
		article.append(indicador).append(valor);
		$(".cont-detalle-barrio").append(article);
	});
})

function getConenido(){
	//se llama la base de datos
	if (sessionStorage.getItem("dm2") === null) {
		//si no la encuentra en la sesion la vuelve a llamar
		$.getJSON( "src/db.json", function( data ) {
			//la carga en una variable
			_db = data;
		  	sessionStorage.setItem("dm2", JSON.stringify(_db));
		});
	}else{
		//si la encuentra en la sesion la carga en una variable
		_db = JSON.parse(sessionStorage.getItem("dm2"));
	}
}

function buildMenu(){
	//construlle el menu a aprtir de la base de datos
	$.each(_db.menu, function(key, val){
		$("#cbp-spmenu-s1").append('<a class="navegar" href="'+val.href+'?id='+_db.municipios.id+'&cat='+val.categoria+'"><i class="'+val.icon+'"></i> '+val.nombre+'</a>');
	});
	//Salir e inicio son transversales a cualquier menu
	$("#cbp-spmenu-s1").append('<a href="javascript:endSession();"><i class="fa fa-sign-out"></i> Salir</a>');
	$("#cbp-spmenu-s1").prepend('<a href="index.html"><i class="fa fa-home"></i> Inicio</a>');
}

function buildPagina(){	
	//carga el contenido de cada pagina dependiendo del nombre en el imput hidden
	switch(_actualPage) {
    case "inicio":        
		buildInicio();	
        break;
    case "municipio":        
		buildMunicipio();	
        break;
    case "comuna-detalle":        
		buildComunaDetalle();	
        break;
    case "informes":
    	buildInformes();
    	break;
    case "informe-detalle":
    	buildInformeDetalle();
    	break;
    case "mi-cuenta":
    	buildMiCuenta();
    	break;
	}
}

function endSession(){
	//cierra la sesion
    sessionStorage.removeItem("usuario");
    if (sessionStorage.getItem("dm2") !== null) {
		sessionStorage.removeItem("dm2");
	}
	//envia al login
	window.location.href = 'login.html';
}



function buildInicio(){
	//revisa si es la privera vez que va entrar a inicio en esta sesion
	if (sessionStorage.getItem("nuevo") == "si") {
		//si es la primera vez cambia el valor de la variable de sesion a "no"
		sessionStorage.setItem("nuevo", "no");
		//si es primera vez recarga la pagina -- un busito que se soluciono asi
		//proque estaba cargando la pagina index.html en balnco con nada en el menu
		// pero en aplication en el inspector si estaba todo cargado... raro
		window.location.href = "index.html";
	}

	//crear la imagen de usuario
	$(".usuario-imagen img").attr("src", "images/usuarios/"+_user.img);
	//crear el nombre del usuario
	$(".usuario-nombre").html(_user.pnom+" "+_user.pape);
	//crea el cargo del usuario
	$(".usuario-cargo").html(_user.ocupacion);	
	//crear el nombre del municipio
	$(".nombre-municipio").html(_db.municipios.nombre);	
	//Crear el listado de estadisticas
  $.each( _db.municipios.estadisticas, function( key, val ) {
    var article = $("<article/>").prop("class", "row");
    var indicador = $("<div/>").prop("class", "col-xs-6 der").html("<p><strong>"+val.indicador+"</strong></p>");
    var valor = $("<div/>").prop("class", "col-xs-6 izq").html("<p>"+val.valor+"</p>");
    article.append(indicador).append(valor);
    $( ".estadisticas").append(article);
  });
}

function buildMunicipio(){
	var idMunicipio = getQueryString("id");
	var categoria = getQueryString("cat");
	$.each(_db.municipios.categorias, function(k, v){
		$("#slct-categoria").append("<option value='"+v.id+"'>"+v.categoria+"</option>")
	});
	$("#slct-categoria").val(categoria);
	$("#map-viewer").prop("src", "maps/"+categoria+".html");
}

function buildComunaDetalle(){
	md = {};
	var idMunicipio = getQueryString("idm");
	var idComuna = getQueryString("idc");
	var idCategoria = getQueryString("cat");
	if (idCategoria == 'obras') {
		$("#indicador-grafico").addClass("hide");
	}
	md.categoria = encuentra(idCategoria, _db.municipios.categorias, "categoria");
	md.comuna = encuentra(idComuna, _db.municipios.comunas);
	md.fecha_mod = md.comuna.fecha_mod;
	md.media = encuentra(idCategoria, md.comuna.medias);
	md.cant = suma(md.comuna.barrios, idCategoria, "actual");

	$(".titulo-comuna").html("Comuna "+idComuna);
	$(".titulo-categoria").html(md.categoria);
	$(".titulo-actualizacion").html(md.fecha_mod);
	$(".indicador-valor-actual p").html(md.cant);
	$(".indicador-media strong").html(md.media.valor);

	var diff = md.cant - md.media.valor;
	var operador = "+"; 
	if (diff < md.media.valor) {
		operador = "-";
		diff = diff * -1;
	}
	if (diff > 45) {
		diff = 45;
	}
	if (diff < -45) {
		diff = -45;
	}

	$(".puntero").css({"left" : "calc(50% "+operador+" "+diff+"%)"});

	$.each(md.media.historial, function(key, val){
		$("#slct-historial").append("<option value='"+val.valor+"'>"+val.ano+"</option>");
		if (key == 0) {
			$(".indicador-valor-pasado p").html(val.valor);
		}
	});

	$.each(md.comuna.barrios, function(key, val){
		$("#slct-barrio").append("<option data-categoria='"+idCategoria+"' data-metas='"+JSON.stringify(val)+"' value='"+val.nombre+"'>"+val.nombre+"</option>");
		
	});
}

function buildInformes(){
	$.each(_db.municipios.comunas, function(key, val){
		$("#slct-comuna").append("<option value='"+val.numero+"'>Comuna "+val.numero+"</option>")
	});
}

function buildInformeDetalle(){	
	var idc = getQueryString("idc");
	var todasCategorias = [];
	if (idc == "todo") {		
		var table = $("<table/>");
		table.prop("id", "sample_1");
		var thead = $("<thead/>");
		var tr = $("<tr/>");
		tr.append("<th>Comuna</th>");
		tr.append("<th>Tipo</th>");
		$.each(_db.municipios.categorias, function(key, val){			
			if(getQueryString(val.id) == "si"){
				tr.append("<th>"+val.categoria+"</th>");
				todasCategorias.push(val.id);
			}			
		});
		thead.append(tr);
		table.append(thead);
		table.append("<tbody/>");
		
		$.each(_db.municipios.comunas, function(key, val){
			var tr = $("<tr/>");
			tr.append("<td>Comuna "+val.numero+"</td>");
			tr.append("<td>"+val.tipo+"</td>");

			for (var i = 0; i <=  todasCategorias.length - 1; i++) {				
				if(getQueryString(todasCategorias[i]) == "si"){
					tr.append("<td>"+suma(val.barrios, todasCategorias[i], "actual")+"</td>");
				}	
			}
			table.append(tr);
		});
		$("#informe-detalle").append(table);
	}else{
		var table = $("<table/>");
		table.prop("id", "sample_1");
		var thead = $("<thead/>");
		var tr = $("<tr/>");
		tr.append("<th>Barrio</th>");
		tr.append("<th>Población</th>");
		$.each(_db.municipios.categorias, function(key, val){			
			if(getQueryString(val.id) == "si"){
				tr.append("<th>"+val.categoria+"</th>");
				todasCategorias.push(val.id);
			}			
		});
		thead.append(tr);
		table.append(thead);
		table.append("<tbody/>");
		var comunas = encuentra(idc, _db.municipios.comunas);
		$.each(comunas.barrios, function(key, val){
			var tr = $("<tr/>");
			tr.append("<td>"+val.nombre+"</td>");
			tr.append("<td>"+val.poblacion+"</td>");

			for (var i = 0; i <=  todasCategorias.length - 1; i++) {				
				if(getQueryString(todasCategorias[i]) == "si"){
					tr.append("<td>"+val[todasCategorias[i]].actual+"</td>");
				}	
			}
			table.append(tr);
		});
		$("#informe-detalle").append(table);
	}

	jQuery(document).ready(function() {
    TableDatatablesButtons.init();
});

}

function buildMiCuenta(){
	$("#correo").val(_user.correo);
	$("#usuario").val(_user.usuario);
	$("#pnom").val(_user.pnom);
	$("#snom").val(_user.snom);
	$("#pape").val(_user.pape);
	$("#sape").val(_user.sape);
	$("#ocupacion").val(_user.ocupacion);
	$("#img").prop("src", "images/usuarios/"+_user.img);
}

function getQueryString(name) {
    url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
//Encuentra un objeto en una coleccion segun el valor de una propiedad de este
*/
function encuentra(aguja, pajar, valor){
	var returnable = {};
	var counter = 0;
	$.each(pajar, function(key, val){		
		if(Object.values(val).indexOf(aguja) > -1){
			counter++;
			returnable = val;
		}	
	});
	if (counter > 0) {
		if (valor != null) {
			return returnable[valor];
		}else{
			return returnable;
		}
	}else{
		return false;
	}
}

/*
//Suma todos los valores de una propiedad en una coleccion
*/
function suma(coleccion, propiedad, valor){
	var suma = 0;
	$.each(coleccion, function(key, val){
		if ($.isNumeric(val[propiedad][valor])) {
			suma = suma + val[propiedad][valor];
		}
	});
	return  suma;
}