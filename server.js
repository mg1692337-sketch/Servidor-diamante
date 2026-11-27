const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// El token se configura en Render por seguridad
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// Ruta para despertar el servidor
app.get('/', (req, res) => {
  res.send('Servidor de diamantes activo');
});

// Ruta para crear el link de pago
app.post('/crear-pago', async (req, res) => {
  try {
    const { titulo, precio, idJugador } = req.body;

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            title: titulo || 'Recarga de Diamantes',
            quantity: 1,
            unit_price: Number(precio),
            currency_id: 'ARS'
          }
        ],
        external_reference: String(idJugador),
        notification_url: `${process.env.RENDER_EXTERNAL_URL}/webhook`
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear preferencia' });
  }
});

// Ruta que recibe la confirmación automática de Mercado Pago
app.post('/webhook', (req, res) => {
  console.log('Notificación recibida de Mercado Pago:', req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  
