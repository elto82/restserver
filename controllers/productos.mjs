import { response } from "express";
import { Producto } from "../models/index.mjs";

//obtenerProductos - paginado - total - populate
const obtenerProductos = async (req, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const [total, productos] = await Promise.all([
    Producto.countDocuments(query),
    Producto.find(query)
      .populate("usuario", "nombre")
      .populate("categoria", "nombre")
      .skip(Number(desde))
      .limit(Number(limite)),
  ]);

  res.json({
    total,
    productos,
  });
};

//obtenerProducto - populate {}
const obtenerProducto = async (req, res = response) => {
  const { id } = req.params;
  const producto = await Producto.findById(id)
    .populate("usuario", "nombre")
    .populate("categoria", "nombre");

  res.json(producto);
};

//crearProducto
const crearProducto = async (req, res = response) => {
  const { estado, usuario, ...body } = req.body;

  try {
    const productoDB = await Producto.findOne({ nombre: body.nombre });

    if (productoDB) {
      return res.status(400).json({
        msg: `El producto ${productoDB.nombre} ya existe`,
      });
    }

    // Generar la data a guardar
    const data = {
      ...body,
      nombre: body.nombre.toUpperCase(),
      usuario: req.usuario._id,
    };
    const producto = new Producto(data);

    // Guardar en DB
    await producto.save();

    res.status(201).json(producto);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        msg: "El producto ya existe",
      });
    }
    console.log(err);
    res.status(500).json({
      msg: "Error en el servidor",
    });
  }
};
//actualizarProducto
const actualizarProducto = async (req, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  if (data.nombre) {
    data.nombre = data.nombre.toUpperCase();
  }
  data.usuario = req.usuario._id;

  const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

  res.json(producto);
};

//borrarProducto - estado:false
const borrarProducto = async (req, res = response) => {
  const { id } = req.params;
  const productoBorrado = await Producto.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  res.json(productoBorrado);
};

export {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  borrarProducto,
};
