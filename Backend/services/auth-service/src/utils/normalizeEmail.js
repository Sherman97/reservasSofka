// se creo este metodo con fin de normalizar y estadarizar el correo
// ya que la Ia repitia la misma funcion en los metodoso de register y login
// se creo como un utils, ya que puede ser luego re utilizado en otros metodos
function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

module.exports = { normalizeEmail };
