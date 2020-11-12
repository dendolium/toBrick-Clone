import React, { useState, useCallback } from "react";
import Dropzone from "react-dropzone";
// import Cropper from "react-cropper";
// import "cropperjs/dist/cropper.css";
import * as imageConversion from "image-conversion";
import * as DitherJS from "ditherjs";
import getCanvasPixelColor from "get-canvas-pixel-color";
import { Range } from "react-range";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { storage } from "./firebase";
import domtoimage from "dom-to-image";
import Cropper from "react-easy-crop";
import Slider from "@material-ui/core/Slider";
import getCroppedImg from "./croppedImage";

const stripePromise = loadStripe(
  "pk_test_51HcHKQHgSkHhHhou2FYxwoAig6hXBSPneKhX5X80nnSFynEDyltmVkPOKy0nbd0Y3HDSwyNSUC2RMrzaLHZ0zcfF00DLLeY3Nj"
);

function App() {
  //OPTIONS USED
  var options32color = {
    step: 20, // image width / number of pegs = step (960/32=30)
    algorithm: "ordered",
    palette: [
      [242, 243, 242], // White					(ID - 1)
      [215, 197, 153], // Brick Yellow				(ID - 5)
      [196, 40, 27], // Bright Red				(ID - 21)
      [13, 105, 171], // Bright Blue				(ID - 23)
      [245, 205, 47], // Bright Yellow			(ID - 24)
      [27, 42, 52], // Black					(ID - 26)
      [40, 127, 70], // Dark Green				(ID - 28)
      [231, 99, 24], // Bright Orange			(ID - 106)
      [146, 57, 120], // Bright Reddish Violet	(ID - 124)
      [105, 64, 39], // Reddish Brown			(ID - 192)
      [163, 162, 164], // Medium Stone Grey		(ID - 194)
      [99, 95, 97], // Dark Stone Grey			(ID - 199)
    ],
  };

  var options32bw = {
    step: 20, // image width / number of pegs = step (960/32=30)
    algorithm: "ordered",
    palette: [
      [242, 243, 242], // White					(ID - 1)
      [27, 42, 52], // Black					(ID - 26)
      [163, 162, 164], // Medium Stone Grey		(ID - 194)
      [99, 95, 97], // Dark Stone Grey			(ID - 199)
    ],
  };

  var options48color = {
    step: 20, // image width / step = number of pegs 960/20=48
    algorithm: "ordered",
    palette: [
      [242, 243, 242], // White					(ID - 1)
      [215, 197, 153], // Brick Yellow				(ID - 5)
      [196, 40, 27], // Bright Red				(ID - 21)
      [13, 105, 171], // Bright Blue				(ID - 23)
      [245, 205, 47], // Bright Yellow			(ID - 24)
      [27, 42, 52], // Black					(ID - 26)
      [40, 127, 70], // Dark Green				(ID - 28)
      [231, 99, 24], // Bright Orange			(ID - 106)
      [146, 57, 120], // Bright Reddish Violet	(ID - 124)
      [105, 64, 39], // Reddish Brown			(ID - 192)
      [163, 162, 164], // Medium Stone Grey		(ID - 194)
      [99, 95, 97], // Dark Stone Grey			(ID - 199)
    ],
  };

  var options48bw = {
    step: 20, // image width / step = number of pegs 960/20=48, 960/18=32
    algorithm: "ordered",
    palette: [
      [242, 243, 242], // White					(ID - 1)
      [27, 42, 52], // Black					(ID - 26)
      [163, 162, 164], // Medium Stone Grey		(ID - 194)
      [99, 95, 97], // Dark Stone Grey			(ID - 199)
    ],
  };

  const [cropper, setCropper] = useState(0);
  const [imageToBeUsed, setImageToBeUsed] = useState("");
  const [fileToBeUsed, setFileToBeUsed] = useState("");
  // const [croppedImage, setCroppedImage] = useState("");
  const [dithered, setDithered] = useState(false);
  const [values, setValues] = useState([0]);
  const [totoalAmountToBePaid, setTotalAmountToBePaid] = useState(0);
  const [paymentInProcess, setPaymentInProcess] = useState(false);
  const [ErrorInAmountToBePaid, setErrorInAmountToBePaid] = useState(false);
  const [instructionsObject, setInstructionsObject] = useState({});
  const [showPayButton, setShowPayButton] = useState(false);
  const [IDForDitheredImage, setIDForDitheredImage] = useState(false);
  const [loadingForSelect, setLoadingForSelect] = useState(false);
  const [textToBeShownWhileLoading, setTextToBeShownWhileLoading] = useState(
    ""
  );
  const [errorLoadedImage, setErrorLoadedImage] = useState(false);

  //changing the image
  const changeImage = (files) => {
    const file = files[0];

    if (!file.name.includes(".jpg") && !file.name.includes(".jpeg")) {
      setErrorLoadedImage(true);
    } else {
      setErrorLoadedImage(false);
      setImageToBeUsed(file.name);
      setFileToBeUsed(file);
      setDithered(false);
      setCroppedImage("");

      imageConversion.filetoDataURL(file).then((res) => {
        //The res in the promise is a compressed Blob type (which can be treated as a File type) file;
        setImageToBeUsed(res);
      });
    }
  };

  //setting the croppedImage
  // const _crop = () => {
  //   setCroppedImage(cropper.getCroppedCanvas().toDataURL());
  // };

  //apply dithering to specific image
  const ditherImage = (e) => {
    //32 B&W
    const ditherjs32BW = new DitherJS(options32bw);
    const options32BWImage = document.getElementById("options32BWImage");
    ditherjs32BW.dither(options32BWImage, options32bw);

    // 32 color
    const ditherjs32Color = new DitherJS(options32color);
    const options32colorImage = document.getElementById("options32colorImage");
    ditherjs32Color.dither(options32colorImage, options32color);

    //48 B&W
    const ditherjs48BW = new DitherJS(options48bw);
    const options48BWImage = document.getElementById("options48BWImage");
    ditherjs48BW.dither(options48BWImage, options48bw);

    //48 color
    const ditherjs48Color = new DitherJS(options48color);
    const options48colorImage = document.getElementById("options48colorImage");
    ditherjs48Color.dither(options48colorImage, options48color);

    setDithered(true);
  };

  //getting the token for redirection
  const sendPayment = async () => {
    if (!totoalAmountToBePaid == 0) {
      setPaymentInProcess(true);
      setTextToBeShownWhileLoading("Calculating blocks");
      let dimensions = "";
      const stripe = await stripePromise;

      //getting the document for conversion
      if (IDForDitheredImage == "first") {
        var canvas = document.getElementById("first_one");
        dimensions = "32x32";
      } else if (IDForDitheredImage == "second") {
        var canvas = document.getElementById("second_one");
        dimensions = "32x32";
      } else if (IDForDitheredImage == "third") {
        var canvas = document.getElementById("third_one");
        dimensions = "48x48";
      } else {
        var canvas = document.getElementById("fourth_one");
        dimensions = "48x48";
      }

      let obj = [];

      setTimeout(() => {
        if (IDForDitheredImage == "first") {
          //bricks
          let white = 0;
          let black = 0;
          let mediumStoneGrey = 0;
          let darkStoneGrey = 0;

          //getting the actual image
          var canvas = document.getElementsByClassName("options32BWImage")[0];

          //finding the colors palletes accordingly
          for (let xAxis = 0; xAxis < 640; xAxis += 20) {
            for (let yAxis = 0; yAxis < 640; yAxis += 20) {
              var color = getCanvasPixelColor(canvas, xAxis, yAxis);
              console.log(color.rgb);
              if (color.rgb == "rgb(242,243,242)") {
                white++;
              } else if (color.rgb == "rgb(27,42,52)") {
                black++;
              } else if (color.rgb == "rgb(163,162,164)") {
                mediumStoneGrey++;
              } else {
                darkStoneGrey++;
              }
            }
          }

          setLoadingForSelect(false);

          //object to be sent to the backend
          obj = [white, black, mediumStoneGrey, darkStoneGrey];
          setInstructionsObject(obj);
        } else if (IDForDitheredImage == "second") {
          //bricks
          let white = 0;
          let black = 0;
          let mediumStoneGrey = 0;
          let darkStoneGrey = 0;
          let brickYellow = 0;
          let brightYellow = 0;
          let brightRed = 0;
          let brightBlue = 0;
          let darkGreen = 0;
          let brightOrange = 0;
          let brightReddishViolet = 0;
          let reddishBrown = 0;

          //getting the actual image
          var canvas = document.getElementsByClassName(
            "options32colorImage"
          )[0];

          //finding the colors palletes accordingly
          for (let xAxis = 0; xAxis < 640; xAxis += 20) {
            for (let yAxis = 0; yAxis < 640; yAxis += 20) {
              var color = getCanvasPixelColor(canvas, xAxis, yAxis);
              console.log(color.rgb);
              if (color.rgb == "rgb(242,243,242)") {
                white++;
              } else if (color.rgb == "rgb(27,42,52)") {
                black++;
              } else if (color.rgb == "rgb(163,162,164)") {
                mediumStoneGrey++;
              } else if (color.rgb == "rgb(99,95,97)") {
                darkStoneGrey++;
              } else if (color.rgb == "rgb(215,197,153)") {
                brickYellow++;
              } else if (color.rgb == "rgb(196,40,27)") {
                brightRed++;
              } else if (color.rgb == "rgb(13,105,171)") {
                brightBlue++;
              } else if (color.rgb == "rgb(245,205,47)") {
                brightYellow++;
              } else if (color.rgb == "rgb(40,127,70)") {
                darkGreen++;
              } else if (color.rgb == "rgb(231,99,24)") {
                brightOrange++;
              } else if (color.rgb == "rgb(146,57,120)") {
                brightReddishViolet++;
              } else if (color.rgb == "rgb(105,64,39)") {
                reddishBrown++;
              }
            }
          }

          setLoadingForSelect(false);

          //object to be sent to the backend
          obj = [
            white,
            black,
            mediumStoneGrey,
            darkStoneGrey,
            brickYellow,
            brightBlue,
            brightOrange,
            brightRed,
            darkGreen,
            brightReddishViolet,
            reddishBrown,
            brightYellow,
          ];
          setInstructionsObject(obj);
        } else if (IDForDitheredImage == "third") {
          //bricks
          let white = 0;
          let black = 0;
          let mediumStoneGrey = 0;
          let darkStoneGrey = 0;

          //getting the actual image
          var canvas = document.getElementsByClassName("options48BWImage")[0];

          //finding the colors palletes accordingly
          for (let xAxis = 0; xAxis < 960; xAxis += 20) {
            for (let yAxis = 0; yAxis < 960; yAxis += 20) {
              var color = getCanvasPixelColor(canvas, xAxis, yAxis);
              console.log(color);
              if (color.rgb == "rgb(242,243,242)") {
                white++;
              } else if (color.rgb == "rgb(27,42,52)") {
                black++;
              } else if (color.rgb == "rgb(163,162,164)") {
                mediumStoneGrey++;
              } else {
                darkStoneGrey++;
              }
            }
          }

          setLoadingForSelect(false);

          //object to be sent to the backend
          obj = [white, black, mediumStoneGrey, darkStoneGrey];
          setInstructionsObject(obj);
        } else {
          //bricks
          let white = 0;
          let black = 0;
          let mediumStoneGrey = 0;
          let darkStoneGrey = 0;
          let brickYellow = 0;
          let brightYellow = 0;
          let brightRed = 0;
          let brightBlue = 0;
          let darkGreen = 0;
          let brightOrange = 0;
          let brightReddishViolet = 0;
          let reddishBrown = 0;

          //getting the actual image
          var canvas = document.getElementsByClassName(
            "options48colorImage"
          )[0];

          //finding the colors palletes accordingly
          for (let xAxis = 0; xAxis < 960; xAxis += 20) {
            for (let yAxis = 0; yAxis < 960; yAxis += 20) {
              var color = getCanvasPixelColor(canvas, xAxis, yAxis);
              console.log(color);
              if (color.rgb == "rgb(242,243,242)") {
                white++;
              } else if (color.rgb == "rgb(27,42,52)") {
                black++;
              } else if (color.rgb == "rgb(163,162,164)") {
                mediumStoneGrey++;
              } else if (color.rgb == "rgb(99,95,97)") {
                darkStoneGrey++;
              } else if (color.rgb == "rgb(215,197,153)") {
                brickYellow++;
              } else if (color.rgb == "rgb(196,40,27)") {
                brightRed++;
              } else if (color.rgb == "rgb(13,105,171)") {
                brightBlue++;
              } else if (color.rgb == "rgb(245,205,47)") {
                brightYellow++;
              } else if (color.rgb == "rgb(40,127,70)") {
                darkGreen++;
              } else if (color.rgb == "rgb(231,99,24)") {
                brightOrange++;
              } else if (color.rgb == "rgb(146,57,120)") {
                brightReddishViolet++;
              } else if (color.rgb == "rgb(105,64, 39)") {
                reddishBrown++;
              }
            }
          }

          setLoadingForSelect(false);

          //object to be sent to the backend
          obj = [
            white,
            black,
            mediumStoneGrey,
            darkStoneGrey,
            brickYellow,
            brightBlue,
            brightOrange,
            brightRed,
            darkGreen,
            brightReddishViolet,
            reddishBrown,
            brightYellow,
          ];
          setInstructionsObject(obj);
        }
        console.log("array: ", obj);
        setTextToBeShownWhileLoading("Fetching those legos");

        //getting the dithered image
        domtoimage
          .toBlob(canvas)
          .then(function (blob) {
            const rootRef = storage.ref();
            const date = Date.now();
            let refURLDitheredImage = `${date}/image1.jpg`;
            const fileRefDitheredImage = rootRef.child(refURLDitheredImage);

            fileRefDitheredImage
              .put(blob)
              .then(function (snapshot) {
                let refURL = `${date}/image2.jpg`;
                const fileRef = rootRef.child(refURL);
                setTextToBeShownWhileLoading("Now painting the legos");

                fileRef.put(fileToBeUsed).then(function (snapshot) {
                  //calling the back end function to generate session id for checkout

                  setTimeout(() => {
                    setTextToBeShownWhileLoading("Almost there");
                  }, 200);
                  console.log(obj);
                  axios
                    .get(
                      `https://cors-anywhere.herokuapp.com/https://us-central1-to-brick-clone.cloudfunctions.net/checkout?amount=${totoalAmountToBePaid}&instructions=${obj}&date=${date}&dimensions=${dimensions}`
                    )
                    .then((res) => {
                      console.log("res", res);
                      // When the customer clicks on the button, redirect them to Checkout.
                      stripe.redirectToCheckout({
                        sessionId: res.data.id,
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                });
              })
              .catch((err) => {
                console.log("err in second promise: ", err);
              });
          })
          .catch((err) => {
            console.log("err in first promise: ", err);
          });
      }, 1000);
    } else {
      setErrorInAmountToBePaid(true);
    }
  };

  //changing payment amount
  const handlePaymentAmount = (e) => {
    setErrorInAmountToBePaid(false);
    setShowPayButton(false);
    const { value, id } = e.target;
    setIDForDitheredImage(id);
    setShowPayButton(true);
    setTotalAmountToBePaid(value);
  };

  // cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState("");

  const _crop = useCallback(async () => {
    setDithered(false);
    setCroppedImage("");
    try {
      const croppedImage = await getCroppedImg(
        imageToBeUsed,
        croppedAreaPixels
      );
      console.log("donee", { croppedImage });
      setCroppedImage(croppedImage);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels]);

  const onClose = useCallback(() => {
    setCroppedImage(null);
  }, []);

  return (
    <div>
      {loadingForSelect ? (
        <div className="loading-container">Please wait</div>
      ) : (
        <></>
      )}
      <div className="container pt-5 mt-5">
        {errorLoadedImage ? (
          <div className="alert alert-danger col-12 text-center">
            Please upload a JPG or JPEG file
          </div>
        ) : (
          <></>
        )}
        {/* Upload image button */}
        {/* START */}
        <div className="offset-3 col-5 ">
          <div className="text-center">
            <Dropzone onDrop={(acceptedFiles) => changeImage(acceptedFiles)}>
              {({ getRootProps, getInputProps }) => (
                <section className="">
                  <div
                    {...getRootProps()}
                    className="border p-5 custom-border-image"
                  >
                    <input {...getInputProps()} />
                    <p>
                      {imageToBeUsed != ""
                        ? "Change image?"
                        : "Drag 'n drop a here, or click to select one"}
                    </p>
                  </div>
                </section>
              )}
            </Dropzone>
            {/* END */}

            {/* this will only appear when image is uploaded */}
            {imageToBeUsed != "" ? (
              <>
                {/* Crop Image */}
                {/* START */}
                <div id="image-to" className="pt-5 mt-3 ">
                  <div className="crop-container">
                    <Cropper
                      image={imageToBeUsed}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  <div className="controls">
                    <Slider
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e, zoom) => setZoom(zoom)}
                      // classes={{ container: "slider" }}
                      className="slider"
                    />
                    <button className="btn btn-primary" onClick={_crop}>
                      Crop
                    </button>
                  </div>
                </div>

                {croppedImage != "" ? (
                  <div className="cropped-preview">
                    <h1>Cropped Image</h1>
                    <img src={croppedImage} width="250" height="250" />
                    <div className="row">
                      <button
                        className="btn btn-primary button-centered"
                        onClick={ditherImage}
                      >
                        Dither
                      </button>
                    </div>
                  </div>
                ) : (
                  <></>
                )}

                {/* END */}
              </>
            ) : (
              <></>
            )}
          </div>
        </div>

        {/* DITHERING START */}
        {croppedImage != "" ? (
          <div className={"row overflow-y" + (dithered ? " opacity" : "")}>
            <div className="col">
              <div class="pt-5 m-2">
                <div id="first_one" class="container32">
                  <img
                    id="options32BWImage"
                    src={croppedImage}
                    height="640"
                    width="640"
                    className="options32BWImage"
                    // style={{ display: "none;" }}
                  />
                  {dithered ? <div class="peg"></div> : <></>}
                </div>
              </div>
              {/* {loadingForSelect && IDForDitheredImage == "first" ? (
                <div className="col-12 alert alert-info text-center">
                  Calculating, please wait
                </div>
              ) : (
                <></>
              )} */}
              <div class="input-group mt-3 pb-5 mb-4">
                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">
                    Wall Art Version
                  </label>
                </div>

                <select
                  onChange={handlePaymentAmount}
                  class="custom-select"
                  id="first"
                  disabled={!dithered}
                >
                  <option selected>Please Select One</option>
                  <option value="100">Box set version (1$)</option>
                  <option value="200">Assembled version(2$)</option>
                </select>
              </div>
              {/* <button onClick={handlePayment} className="btn btn-primary offset-3 col-5">Pay</button> */}
            </div>
            <div className="col">
              <div class="pt-5 m-2">
                <div id="second_one" class="container32">
                  <img
                    id="options32colorImage"
                    src={croppedImage}
                    height="640"
                    width="640"
                    className="options32colorImage"
                    // style={{ display: "none;" }}
                  />
                  {dithered ? <div class="peg"></div> : <></>}
                </div>
              </div>
              {loadingForSelect && IDForDitheredImage == "second" ? (
                <div className="col-12 alert alert-info text-center">
                  Calculating, please wait
                </div>
              ) : (
                <></>
              )}

              <div class="input-group mt-3 pb-5 mb-4">
                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">
                    Wall Art Version
                  </label>
                </div>

                <select
                  onChange={handlePaymentAmount}
                  class="custom-select"
                  id="second"
                  disabled={!dithered}
                >
                  <option selected>Please Select One</option>
                  <option value="100">Box set version (1$)</option>
                  <option value="200">Assembled version(2$)</option>
                </select>
              </div>
              {/* <button onClick={handlePayment} className="btn btn-primary offset-3 col-5">Pay</button> */}
            </div>

            <div className="col">
              <div class="pt-5 m-2">
                <div id="third_one" class="container48">
                  <img
                    id="options48BWImage"
                    src={croppedImage}
                    height="960"
                    width="960"
                    className="options48BWImage"
                    // style={{ display: "none;" }}
                  />
                  {dithered ? <div class="peg"></div> : <></>}
                </div>
              </div>
              <div class="input-group mt-3 pb-5 mb-4">
                {loadingForSelect && IDForDitheredImage == "third" ? (
                  <div className="col-12 alert alert-info text-center">
                    Calculating, please wait
                  </div>
                ) : (
                  <></>
                )}

                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">
                    Wall Art Version
                  </label>
                </div>

                <select
                  onChange={handlePaymentAmount}
                  class="custom-select"
                  id="third"
                  disabled={!dithered}
                >
                  <option selected>Please Select One</option>
                  <option value="100">Box set version (1$)</option>
                  <option value="200">Assembled version(2$)</option>
                </select>
              </div>
              {/* <button onClick={handlePayment} className="btn btn-primary offset-3 col-5">Pay</button> */}
            </div>
            <div className="col">
              <div id="fourth_one" class="pt-5 m-2">
                <div class="container48">
                  <img
                    id="options48colorImage"
                    src={croppedImage}
                    height="960"
                    width="960"
                    className="options48colorImage"
                    // style={{ display: "none;" }}
                  />
                  {dithered ? <div class="peg"></div> : <></>}
                </div>
              </div>
              <div class="input-group mt-3 pb-5 mb-4">
                {loadingForSelect && IDForDitheredImage == "fourth" ? (
                  <div className="col-12 alert alert-info text-center">
                    Calculating, please wait
                  </div>
                ) : (
                  <></>
                )}

                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">
                    Wall Art Version
                  </label>
                </div>

                <select
                  onChange={handlePaymentAmount}
                  class="custom-select"
                  id="fourth"
                  disabled={!dithered}
                >
                  <option selected>Please Select One</option>
                  <option value="100">Box set version (1$)</option>
                  <option value="200">Assembled version(2$)</option>
                </select>
              </div>
              {/* <button onClick={handlePayment} className="btn btn-primary offset-3 col-5">Pay</button> */}
            </div>

            {textToBeShownWhileLoading != "" ? (
              <div className="col-12 alert alert-info">
                {textToBeShownWhileLoading}
              </div>
            ) : (
              <></>
            )}
            {showPayButton ? (
              <button
                role="link"
                onClick={sendPayment}
                className={
                  "btn btn-primary col-4 " +
                  (paymentInProcess ? "disabled" : "")
                }
              >
                {paymentInProcess ? "Please Wait" : "Pay"}
              </button>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}

        {/* DITHERING END */}
      </div>
    </div>
  );
}

export default App;
