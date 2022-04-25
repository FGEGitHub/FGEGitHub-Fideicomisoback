const express = require('express')
const router = express.Router()
const pool = require('../database')
const { isLoggedIn } = require('../lib/auth') //proteger profile
const { isLevel2 } = require('../lib/authnivel2')
const XLSX = require('xlsx')


router.get('/cargar_todos', isLoggedIn, isLevel2, async (req, res) => {
    console.log("entra")
  const workbook = XLSX.readFile('./src/Excel/Base de Clientes TANGO 04-22.xlsx')
    const workbooksheets = workbook.SheetNames
    const sheet = workbooksheets[0]

    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
    //console.log(dataExcel)
    console.log(dataExcel)

    const palabra = 'LEY'
    console.log(palabra.includes('LEY'))
    var a=1
    for (const property in dataExcel) {
        a+=1
        try{
        const newLink = {
            id:dataExcel[property]['Cód. cliente'],
            razon_social: dataExcel[property]['Razón social'],
            nombre : dataExcel[property]['Nombre comercial'],
            tipo_dni:dataExcel[property]['Tipo de documento'],
            domicilio:dataExcel[property]['Domicilio'],
            cuil_cuit: dataExcel[property]['Número'],
            localidad: dataExcel[property]['Localidad'],
            cp: dataExcel[property]['Cód. Postal'],
            telefono: dataExcel[property]['Teléfono'],
            movil:dataExcel[property]['Móvil'],
            email: dataExcel[property]['E-mail'],
            responsable_del_pago: dataExcel[property]['Responsable del pago'],
            cod_provincia: dataExcel[property]['Cód. provincia'],
            provincia: dataExcel[property]['Provincia'],
            cod_zona: dataExcel[property]['Cód. de Zona'],
            zona: dataExcel[property]['Zona'],
            condicion_de_iva: dataExcel[property]['Condición de IVA'],
            condicion_de_venta: dataExcel[property]['Sucursal'],
            descripcion_cond_de_venta: dataExcel[property]['Descripción Condición de Venta'],
            porc_bonificacion: dataExcel[property]['% de bonificación'],
            clausula_moneda_extranjera: dataExcel[property]['Cláusula moneda extranjera'],
            fecha_alta: dataExcel[property]['Fecha de alta'],
            Inhabilitado: dataExcel[property]['Inhabilitado'],
            RG_1817: dataExcel[property]['RG 1817'],
            otros_impuestos: dataExcel[property]['Otros impuestos'],
            iva_liberado_habitual: dataExcel[property]['I.V.A. liberado (habitual)'],
            percepcion_ib: dataExcel[property]['Percepción IB (habitual)'],
            percepcion_ib_bs_as_59_98: dataExcel[property]['Percep. IB. Bs.AS. 59/98 (habitual)'],
            direcciones_de_entrega: dataExcel[property]['Direcciones de entrega'],
            observaciones: dataExcel[property]['Observaciones'],
            idiomas_comprobantes: dataExcel[property]['Idioma Comprobantes de Exportación'],
            incluye_comentarios_de_articulos: dataExcel[property]['Incluye Comentarios de los Artículos'],
            debitos_por_mora: dataExcel[property]['Débitos por mora'],
            empresa_vinculada: dataExcel[property]['Empresa vinculada'],
            inhabilitado_nexo_cobranzas: dataExcel[property]['Inhabilitado nexo Cobranzas'],
            id_lote_nombre: dataExcel[property]['Identificación Lote (Adic.)'],
           



        }
      

        await pool.query('INSERT INTO clientes set ?', [newLink]);
    }catch(e){
        console.log(e)
    }
       
        /* if ((dataExcel[property]['Sucursal']).includes(cuil_cuit)) {
            estado = 'A'
        }*/

    }
 



    res.redirect('/links/clientes')
})




router.get('/add', isLoggedIn, isLevel2, (req, res) => {
    res.render('links/add')

})

router.get('/clientes', isLoggedIn, isLevel2, (req, res) => {
    res.render('links/clientes')

})
//editar

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const links = await pool.query('SELECT * FROM clientes WHERE id= ?', [id])

    res.render('links/edit', { link: links[0] })
})



router.get("/:cuil_cuit", isLoggedIn, isLevel2, async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit // requiere el parametro id 
    const links = await pool.query('SELECT * FROM clientes WHERE cuil_cuit= ?', [cuil_cuit]) //[req.user.id]

    console.log(links)

    res.render('links/list', { links })
})

router.get("/app/:app", isLoggedIn, isLevel2, async (req, res) => {
    const app = req.params.app // requiere el parametro id 
    const links = await pool.query('SELECT * FROM clientes WHERE Apellido = ?', [app]) //[req.user.id]
    res.render('links/list', { links })
})


router.get("/algo/prueba", isLoggedIn, isLevel2, async (req, res) => { //probando
    var str = 20-32587415-3
    /*part1 = str.substring(0, 2);
    part3 = str.substring(3, 11);
    part3 = str.substring(12 , str.length);
    const cuil_cuit= part1 + part2 + part3
  
    console.log (cuil_cuit);*/


   /*var a = "01234156789"
   a =  (a).slice(0, 2) + "-" + (a).slice(2);
   console.log(a)
   a =  (a).slice(0, 11) + "-" + (a).slice(11);
    console.log(a)
  */
    res.render('links/prueba')
})




router.post('/add', isLoggedIn, isLevel2, async (req, res) => {
    const { Nombre, Apellido, domicilio, cuil_cuit, razon } = req.body;
    const newLink = {
        Nombre,
        Apellido,
        razon,
        domicilio,
        cuil_cuit
        //user_id: req.user.id
    };


    const row = await pool.query('Select * from clientes where cuil_cuit = ?', [req.body.cuil_cuit]);

    if (row.length > 0) {
        req.flash('message', 'Error cuil_cuit ya existe')
        res.redirect('/links/clientes')
    }
    else {
        await pool.query('INSERT INTO clientes set ?', [newLink]);
        req.flash('success', 'Guardado correctamente')
        res.redirect('/links/clientes')
    }
    
})

//borrar de lista
router.get('/delete/:id', isLoggedIn, isLevel2, async (req, res) => {
    const { id } = req.params.id
    await pool.query('DELETE FROM clientes WHERE ID = ?', [id])
    req.flash('success', 'Cliente eliminado')
    res.redirect('/links')
})


router.post('/edit/:id', isLevel2, async (req, res) => {
    const { id } = req.params
    const { Nombre, Apellido, domicilio } = req.body
    const newLink = {
        Nombre,
        Apellido,
        domicilio
    }
    await pool.query('UPDATE clientes set ? WHERE id = ?', [newLink, id])
    
    req.flash('success', 'Cliente modificado correctamente')
    res.redirect('/links')
})



// buscar cliente por apellido no esta conectado
router.post('/listacuil_cuit', isLoggedIn, isLevel2, async (req, res, next) => {
    const { cuil_cuit } = req.body
    console.log(cuil_cuit)
    const rows = await pool.query('SELECT * FROM clientes WHERE cuil_cuit = ?', [cuil_cuit])
    console.log(rows)
    if (rows.length > 0) {
        res.redirect(`/links/${cuil_cuit}`)


    } else {
        req.flash('message', 'Error, cuil/cuit no encontrado ')
        res.redirect('clientes')
    }
})

router.post('/listapp', isLoggedIn, isLevel2, async (req, res, next) => {
    const { app } = req.body
    console.log(app)
    const rows = await pool.query('SELECT * FROM clientes WHERE Apellido = ?', [app])

    if (rows.length > 0) {
        res.redirect(`/links/app/${app}`)


    } else {
        req.flash('message', 'Error, Apellido no encontrado ')
        res.redirect('clientes')
    }
})

module.exports = router





