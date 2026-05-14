import pkg from "whatsapp-web.js";

const {
    Client,
    LocalAuth
} = pkg;

import qrcode from "qrcode-terminal";
import dotenv from "dotenv";

dotenv.config();
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
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
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );
const app = express();
// WHATSAPP CLIENT
const client = new Client({

    authStrategy:
        new LocalAuth()

});

// QR
client.on("qr", (qr) => {

    qrcode.generate(qr, {
        small: true
    });

    console.log("QR okut 📱");

});

// READY
client.on("ready", () => {

    console.log(
        "WhatsApp hazır ✅"
    );

});

client.initialize();

app.use(cors());
app.use(express.json());

app.post(
    "/send-whatsapp",

    async (req, res) => {

        try {

            const {
                phone,
                message
            } = req.body;

            const formattedPhone =
                `${phone}@c.us`;

            await client.sendMessage(
                formattedPhone,
                message
            );

            res.json({
                success: true
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({

                success: false,

                error: err.message

            });

        }

    }
);
app.post(
    "/save-token",

    async (req, res) => {

        try {

            console.log("SAVE TOKEN ÇALIŞTI");
            console.log(req.body);

            const { token } = req.body;

            const { data, error } =
                await supabase
                    .from("fcm_tokens")
                    .upsert(
                        [{ token }],
                        {
                            onConflict: "token",
                        }
                    )
                    .select();

            console.log("SUPABASE DATA:", data);
            console.log("SUPABASE ERROR:", error);

            if (error) {
                throw error;
            }

            res.json({
                success: true,
            });

        } catch (err) {

            console.log("SAVE TOKEN HATA:");
            console.log(err);

            res.status(500).json({
                success: false,
            });

        }
    }
);
app.post(
  "/send-push",

  async (req, res) => {

    try {

      console.log(
        req.body
      );

        const {
            title,
            body,
        } = req.body;

        const { data, error } =
            await supabase
                .from("fcm_tokens")
                .select("token");

        if (error) {
            throw error;
        }

        const tokens =
            data.map(
                item => item.token
            );

        await admin
            .messaging()
            .sendEachForMulticast({

                tokens,

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