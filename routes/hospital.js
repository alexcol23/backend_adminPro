const express = require('express');
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// ======================================================
// Obtener todos los Hospitales
// ======================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error consultando los hospitales',
                        errors: err
                    })
                }
                Hospital.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: count
                    })
                })

            });

});

// ======================================================
// Actualizar un hospital
// ======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, 'nombre img usuario')
        .exec(
            (err, hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar el hospital',
                        errors: err
                    })
                }
                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital con el ID ' + id + ' no existe!!!',
                        errors: {message: 'No existe un hospital con ese ID.'}
                    })
                }

                hospital.nombre = body.nombre;
                hospital.usuario = req.usuario._id;

                hospital.save((err, hospitalSaved) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar el hospital',
                            errors: err
                        })
                    }
                    res.status(200).json({
                        ok: true,
                        hospial: hospitalSaved
                    })
                })

            });
});

// ======================================================
// Crear un nuevo Hospital
// ======================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            hospial: hospitalSaved,
            usuarioToken: req.usuario
        })
    })
});

// ======================================================
// Eliminar un usuario
// ======================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            })
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el ID ' + id + ' no existe!!!',
                errors: {message: 'No existe un hospital con ese ID.'}
            })
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    })
});
module.exports = app;
