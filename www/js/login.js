$("#frm-login").submit(function(e){
	//Se limpian las alertas
	clearAlerts();
	//se evnita que el fromulario recargue la pagina
	e.preventDefault();
	//se toman la variables
	var user = $("#user").val();
	var pass = $("#pass").val();
	//se trae la lista de usuarios
	$.get("src/users.json", function(datos){
		//contador de coincidencias
		var data = JSON.parse(datos);
		var counter = 0;
		//se recorre el listado de usuarios que vino en "data" 
		$.each(data,function(key, val){//inicio loop
			//$("#debugger").append("<p>"+ typeof data +"</p>");
			//for(val in data){//inicio loop js

			//se pregunta si el usuario ingresado esta en la lista de usuarios
			if(Object.values(val).indexOf(user) > -1){
				//Se encontró
				//se aumenta el contador
				counter++;
				//se carga la sal del listado propia de ese usuario
				var dbSalt = val.salt;
				//se carga el password del listado propio de ese usuario (codificado)
				var dbPass = val.pass;
				//se verifica si el password es el mismo
				if(comparePass(pass, dbPass, dbSalt)){
					//se guarda en variable de sesion el objeto con el nombre "usuario"
					sessionStorage.setItem("usuario", JSON.stringify(val) );
					//se trae la base de datos.jsom
					$.getJSON( "src/db.json", function( data ) {
						var db = data;
						//y se guarda con el nombre "dm2" como un objeto json
						sessionStorage.setItem('dm2', JSON.stringify(db));
					});
					//se limpian todos los campos
					clearAll();
					//se crea una variable de sesion para identificar que es el primer ingreso por sesion
					sessionStorage.setItem("nuevo","si");
					//se envia el inicio
					window.location.href = "index.html";
					return
				}else{
					//se maneja el error 
					manageErrors("pass", "Clave erronea")
					return
				}
			}
		//} fin loop javascript
		});//fin loop jquery
		if (counter < 1) {
			//se maneja el error
			manageErrors("user", "Usuario no encontrado")
		}
		return false;
	});
});

function comparePass(userPass, dbPass, dbSalt){
	/*
	//Recibe el password que el usuario copió, el password codificado del listado de usuarios pertenenciente a ese usuairo y la sal del listado de usuarios perteneciente a ese usuario
	*/

	//crea un nuevo password codificado, con el password copiado por el usuario y la sal del listado de usuarios perteneciente a ese usuario
	var pass = CryptoJS.HmacSHA1(userPass, dbSalt);	
	pass = CryptoJS.enc.Base64.stringify(pass);

	//se pregunta si es igual el password codificiado recien obtenido al password codificado del listado ys e regresa el resultado
	return pass === dbPass ? true : false;
}

function manageErrors(control, mensaje){
	/*
	// recibe el id del input en elque se equivocaron "control", y el mensaje que se va a dar
	*/
	$("#"+control).addClass("form-control-warning");
	$("#"+control+"-help").html(mensaje);
	$(".form-group-"+control).addClass("has-warning");
}

function clearAll(){	
	//limpia todos los campos
	clearAlerts();	
	$("#user").val("");
	$("#pass").val("");
}

function clearAlerts(){
	//limpia solo las alertas
	$(".form-group-user").removeClass("has-warning");
	$(".form-group-pass").removeClass("has-warning");
	$("#user-help").html("");
	$("#pass-help").html("");
	$("#user").removeClass("form-control-warning");
	$("#pass").removeClass("form-control-warning");
	
}