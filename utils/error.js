//Este es un middleware que devuelve un error con el código y el msg que le decimos. 
export const errorHandler = (statusCode, message) =>{
    const error = new Error()
    error.statusCode = statusCode
    error.message = message
    return error
}