// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(
  "sk_test_51HcHKQHgSkHhHhouXnJAB1j2Pgjvt0zwh3JIRtGLO4JA36AiJlB4nwKeaHQwpyeY8wNXTWk1v5potqpIwrThzR6T00eky42Puu"
);

// exports.sendInstructions = functions.https.onRequest(async (req, res) => {
//   const { session_id, imageURL, instructions, ditheredImage } = req.query;

//   let convertToArray = instructions.split(",");

//   let transporter = await nodemailer.createTransport({
//     host: "smtp.pepipost.com",
//     port: 25,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: "legomosaicprep",
//       pass: "legomosaicprep_eef6a8da215f26eb527163f5e9677632",
//     },
//   });

//   res.json({ res: transporter });

//   let text = ``;
//   if (convertToArray.length == 4) {
//     text = `
//     <p>You just recieved an order with the session ID <b>${session_id}</b></p>
//     <br/>
//     <p>Original Image can be found <a href=${imageURL}>here</a></p>
//     <p>Dithered Image can be found <a href=${ditheredImage}>here</a></p>
//     <h3>Bricks</h3>
//     <li>White: ${convertToArray[0]}</li>
//     <li>Black: ${convertToArray[1]}</li>
//     <li>Medium StoneGrey: ${convertToArray[2]}</li>
//     <li>Dark Stone Grey: ${convertToArray[3]}</li>
//   `;
//   } else {
//     text = `
//     <p>You just recieved an order with the session ID <b>${session_id}</b></p>
//     <br/>
//     <p>Original Image can be found <a href=${imageURL}>here</a></p>
//     <p>Dithered Image can be found <a href=${ditheredImage}>here</a></p>
//     <h3>Bricks</h3>
//     <li>White: ${convertToArray[0]}</li>
//     <li>Black: ${convertToArray[1]}</li>
//     <li>Medium StoneGrey: ${convertToArray[2]}</li>
//     <li>Brick Yellow: ${convertToArray[4]}</li>
//     <li>Bright Blue: ${convertToArray[5]}</li>
//     <li>Bright Orange: ${convertToArray[6]}</li>
//     <li>Bright Red: ${convertToArray[7]}</li>
//     <li>Dark Green: ${convertToArray[8]}</li>
//     <li>Bright Reddish Vioet: ${convertToArray[9]}</li>
//     <li>Reddish Brown: ${convertToArray[10]}</li>
//     <li>Bright Yellow: ${convertToArray[11]}</li>
//   `;
//   }

//   transporter
//     .sendMail({
//       from: "info@pepisandbox.com", // sender address
//       to: "lego.mosaic.prep@gmail.com", // list of receivers
//       subject: "Order details", // Subject line
//       // text: "Hello agin", // plain text body
//       html: text, // html body
//     })
//     .then((resp) => {
//       res.json({ res: resp });
//     })
//     .catch((err) => {
//       res.json({ error: err });
//     });
// });

exports.checkout = functions.https.onRequest(async (req, res) => {
  const { amount, instructions, date, dimensions } = req.query;

  let convertedInstructions = instructions.toString();
  convertedInstructions = convertedInstructions.slice(1, -1);
  console.log(req.query);
  console.log(convertedInstructions);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Legos",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://to-brick-clone.firebaseapp.com/success/${convertedInstructions}/{CHECKOUT_SESSION_ID}/${date}/${dimensions}/`,
      cancel_url: "https://to-brick-clone.firebaseapp.com",
      // cancel_url: "http://localhost:3000",
    });
    res.json({ id: session.id });
  } catch (error) {
    res.json({ error: error });
  }
});
