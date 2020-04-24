const express = require('express');
var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// ======================================================
// Obtener todos los Medicos
// ======================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error consultando los medicos',
                        errors: err
                    })
                }
                Medico.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: count
                    })
                })

            });

});

// ======================================================
// Actualizar un medico
// ======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, 'nombre img usuario hospital')
        .exec(
            (err, medico) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar el medico',
                        errors: err
                    })
                }
                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El medico con el ID ' + id + ' no existe!!!',
                        errors: {message: 'No existe un medico con ese ID.'}
                    })
                }

                medico.nombre = body.nombre;
                medico.hospital = body.hospital;
                medico.usuario = req.usuario._id;

                medico.save((err, medicoSaved) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar el medico',
                            errors: err
                        })
                    }
                    res.status(200).json({
                        ok: true,
                        medico: medicoSaved
                    })
                })

            });
});

// ======================================================
// Crear un nuevo Medico
// ======================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err, medicoSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            medico: medicoSaved,
            usuarioToken: req.usuario
        })
    })
});

// ======================================================
// Eliminar un Medico
// ======================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            })
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el ID ' + id + ' no existe!!!',
                errors: {message: 'No existe un medico con ese ID.'}
            })
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        })
    })
});
module.exports = app;
