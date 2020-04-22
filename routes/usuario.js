const express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// ======================================================
// Obtener todos los usuarios
// ======================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre, email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando el usuario',
                        errors: err
                    })
                }
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                })
            });

});

// ======================================================
// Actualizar un usuario
// ======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, 'nombre, email img role')
        .exec(
            (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar el usuario',
                        errors: err
                    })
                }
                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El usuario con el ID ' + id + ' no existe!!!',
                        errors: {message: 'No existe un usuario copn ese ID.'}
                    })
                }

                usuario.nombre = body.nombre;
                usuario.email = body.email;
                usuario.role = body.role;

                usuario.save((err, usuarioSaved) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar el usuario',
                            errors: err
                        })
                    }
                    res.status(200).json({
                        ok: true,
                        usuario: usuarioSaved
                    })
                })

            });
});

// ======================================================
// Crear un nuevo usuario
// ======================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioSaved,
            usuarioToken: req.usuario
        })
    })
});

// ======================================================
// Eliminar un usuario
// ======================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            })
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el ID ' + id + ' no existe!!!',
                errors: {message: 'No existe un usuario copn ese ID.'}
            })
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })
    })
});
module.exports = app;
