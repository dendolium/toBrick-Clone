import React, { useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
import { storage } from "./firebase";
import axios from "axios";
import emailjs from "emailjs-com";

export default function Success() {
  const { instructions, session_id, date, dimensions } = useParams();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    console.log(instructions);

    console.log(instructions.split(","));
    const rootRef = storage.ref();
    let refURLDitheredImage = `${date}/image1.jpg`;
    let refURL = `${date}/image2.jpg`;
    const fileRefDitheredImage = rootRef.child(refURLDitheredImage);
    const fileRef = rootRef.child(refURL);

    // getting the dithering image download URL
    fileRefDitheredImage
      .getDownloadURL()
      .then((ditheredURL) => {
        // getting the original image download URL
        fileRef.getDownloadURL().then((downloadURL) => {
          //sending info via emailjs

          let instructionsConverted = instructions.split(",");

          console.log(instructions);

          if (instructionsConverted.length == 4) {
            var templateParams = {
              session_id,
              imageURL: downloadURL,
              ditheredImage: ditheredURL,
              first: instructionsConverted[0],
              second: instructionsConverted[1],
              third: instructionsConverted[2],
              fourth: instructionsConverted[3],
              dimensions,
              date,
            };
            var templateID = "template_luilbdk";
          } else {
            var templateID = "template_psdgkgl";
            var templateParams = {
              session_id,
              imageURL: downloadURL,
              ditheredImage: ditheredURL,
              first: instructionsConverted[0],
              second: instructionsConverted[1],
              third: instructionsConverted[2],
              fourth: instructionsConverted[3],
              fifth: instructionsConverted[4],
              sixth: instructionsConverted[5],
              seventh: instructionsConverted[6],
              eighth: instructionsConverted[7],
              ninth: instructionsConverted[8],
              tenth: instructionsConverted[9],
              eleventh: instructionsConverted[10],
              twelveth: instructionsConverted[11],
              dimensions,
              date,
            };
          }

          console.log(templateParams);

          emailjs
            .send(
              "gmail",
              templateID,
              templateParams,
              "user_HDqFrLvFhCd30BU9orXX7"
            )
            .then(
              function (response) {
                console.log("SUCCESS!", response.status, response.text);
                setRedirect(true);
              },
              function (err) {
                console.log("FAILED...", err);
              }
            );
        });
      })
      .catch((err) => {
        console.log("err in dithering image download: ", err);
      });
  }, []);

  return (
    <div>
      {redirect ? <Redirect to="/" /> : <></>}
      You will be redirected shortly.
    </div>
  );
}
