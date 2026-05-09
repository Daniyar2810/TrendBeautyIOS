import express from "express";
import cors from "cors";
import axios from "axios";
import admin from "firebase-admin";
const serviceAccount =
  JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );
admin.initializeApp({
  credential:
    admin.credential.cert(
      serviceAccount
    ),
});
const app = express();

app.use(cors());
app.use(express.json());

app.post("/send-whatsapp", async (req, res) => {
  try {
    const { phone, message } = req.body;

    const apiKey = "3058905";

    const url =
      `https://api.callmebot.com/whatsapp.php` +
      `?phone=${phone}` +
      `&text=${encodeURIComponent(message)}` +
      `&apikey=${apiKey}`;

    const response = await axios.get(url);

    res.json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
app.post(
  "/send-push",

  async (req, res) => {

    try {

      console.log(
        req.body
      );

      const {
        token,
        title,
        body,
      } = req.body;

      await admin
        .messaging()
        .send({

          token,

          notification: {
            title,
            body,
          },
        });

      res.json({
        success: true,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);
app.listen(3001, () => {
  console.log("Server çalışıyor :3001");
});
