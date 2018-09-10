
console.log("prueba")
   
function deleteOne (tabla, id) {

    jQuery.ajax({ 
        type: "DELETE",
        dataType: "json",
        url: "http://localhost:5000/"+tabla+"/"+id,
        success: function(){
            console.log("hola")
            window.location.reload(true);
        }
     });
     
}
