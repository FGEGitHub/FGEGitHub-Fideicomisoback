const express = require('express')
const router = express.Router()
const pool = require('../database')
const ponerguion = require('../public/apps/transformarcuit')
const { isLevel3 } = require('../lib/authnivel3')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const XLSX = require('xlsx')



/*
//PERFIL USUARIO NIVEL 3
router.get('/profile', isLoggedIn, isLevel2, (req, res) => {

    res.render('links/add')

})
*/

//ACCESO A MENU DE USUARIO NIVEL 2
router.get('/perfilnivel2', isLoggedIn, isLevel3, async (req, res) => {

    const pagos_p = await pool.query(" Select * from pagos where estado = 'P' ")
    const constancias_p = await pool.query(" Select * from constancias where estado = 'P' ")
    const cbus = await pool.query(" Select * from cbus where estado = 'P' ")
    const chats = await pool.query(" Select * from chats where leido = 'NO' ")

res.render('profile',{pagos_p, constancias_p, cbus, chats})}

)

// AGREGAR USUARIO 

router.get('/agregarusuario', isLoggedIn, isLevel3, (req, res) => {

    res.render('nivel3/agregarusuario')

})

router.post('/agregarunusuario', async (req, res,) => {
    const { cuil_cuit, nombre, mail, nivel } = req.body;
 
const nuevo={
    cuil_cuit,
     nombre,
      mail,
       nivel 
}
  console.log(nuevo)



})




//PAGINA  AGREGAR ICC GENERAL
router.get("/agregariccgral", isLoggedIn,isLevel3, async (req, res) => {


    res.render('cuotas/agregariccgral')
})
//Habilitar usuario para pagar
router.get("/habilitarusuario/:cuil_cuit", isLoggedIn,isLevel3, async (req, res) => {
    let { cuil_cuit } = req.params
    console.log(cuil_cuit)
    habilitado = 'SI'
    aux = {
        habilitado
    }
    await pool.query('UPDATE users set ? WHERE cuil_cuit = ?', [aux, cuil_cuit])
    cuil_cuit = ponerguion.ponerguion(cuil_cuit)
    res.redirect("/links/detallecliente/"+cuil_cuit)
})
//Habilitar usuario para pagar
router.get("/deshabilitarusuario/:cuil_cuit", isLoggedIn,isLevel3, async (req, res) => {
    let { cuil_cuit } = req.params
    habilitado = 'NO'
    aux = {
        habilitado
    }
    await pool.query('UPDATE users set ? WHERE cuil_cuit = ?', [aux, cuil_cuit])
    cuil_cuit = ponerguion.ponerguion(cuil_cuit)

    res.redirect("/links/detallecliente/"+cuil_cuit)
})

//ACCION DE  AGREGAR ICC GENERAL
router.post('/agregariccgral',isLevel3, async (req, res,) => {
    const { ICC, mes, anio } = req.body;
    const todas = await pool.query("select * from cuotas where mes =? and anio =?", [mes, anio])
    const parcialidad = "Final"
    for (var i = 0; i < todas.length; i++) {
        nro_cuota = todas[0]["nro_cuota"]
        cuil_cuit = todas[0]["cuil_cuit"]
       
        if (nro_cuota == 1) {
        
            saldo_inicial = todas[i]["saldo_inicial"]
            const Ajuste_ICC = 0
            const Base_calculo = todas[i]["Amortizacion"]
            const cuota_con_ajuste = todas[i]["Amortizacion"]
            const Saldo_real = todas[i]["saldo_inicial"]
            var cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
                Saldo_real,
                parcialidad
    
            }

        } else {
            const anterior = await pool.query('Select * from cuotas where nro_cuota = ? and cuil_cuit = ?', [nro_cuota - 1, cuil_cuit])

            var Saldo_real_anterior = anterior[0]["Saldo_real"]
    
            const cuota_con_ajuste_anterior = anterior[0]["cuota_con_ajuste"]
    
            const Base_calculo = cuota_con_ajuste_anterior
            const Ajuste_ICC = cuota_con_ajuste_anterior * ICC
    
            const cuota_con_ajuste = cuota_con_ajuste_anterior + Ajuste_ICC
            Saldo_real_anterior += Ajuste_ICC
            const Saldo_real = Saldo_real_anterior

            var cuota = {
                ICC,
                Ajuste_ICC,
                Base_calculo,
                cuota_con_ajuste,
                Saldo_real,
                parcialidad
    
            }
        }
    
        try {
            await pool.query('UPDATE cuotas set ? WHERE id = ?', [cuota, todas[i]["id"]])

        } catch (error) {
            console.log(error)
            res.redirect(`/cuotas`);

        }



    }

    res.redirect(`/profile`);
})






module.exports = router