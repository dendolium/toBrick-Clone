import React, { useState } from "react";
import Dropzone from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import * as imageConversion from "image-conversion";
import * as DitherJS from "ditherjs";

function App() {
  //OPTIONS USED
  var options32color = {
    step: 32, // image width / number of pegs = step (960/32=30)
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
    step: 32, // image width / number of pegs = step (960/32=30)
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
  const [croppedImage, setCroppedImage] = useState("");
  const [dithered, setDithered] = useState(false);
  const [currentImageID, setCurrenImageID] = useState("");

  //changing the image
  const changeImage = (files) => {
    setImageToBeUsed(files[0].name);
    setDithered(false);
    setCroppedImage("");
    setCurrenImageID("");

    console.log(files[0]);
    imageConversion.filetoDataURL(files[0]).then((res) => {
      //The res in the promise is a compressed Blob type (which can be treated as a File type) file;
      setImageToBeUsed(res);
    });
  };

  //setting the croppedImage
  const _crop = () => {
    setCroppedImage(cropper.getCroppedCanvas().toDataURL());
  };

  const ditherImage = (e) => {
    const id = e.target.id;
    setCurrenImageID(id);
    console.log(id);
    setCroppedImage(cropper.getCroppedCanvas().toDataURL());
    if (id == "1") {
      const ditherjs32BW = new DitherJS(options32bw);
      const options32BWImage = document.getElementById("options32BWImage");
      ditherjs32BW.dither(options32BWImage, options32bw);
    } else if (id == "2") {
      const ditherjs32Color = new DitherJS(options32color);
      const options32colorImage = document.getElementById(
        "options32colorImage"
      );
      ditherjs32Color.dither(options32colorImage, options32color);
    } else if (id == "3") {
      const ditherjs32Color = new DitherJS(options48bw);
      const options48BWImage = document.getElementById("options48BWImage");
      ditherjs32Color.dither(options48BWImage, options48bw);
    } else {
      const ditherjs32Color = new DitherJS(options48color);
      const options48colorImage = document.getElementById(
        "options48colorImage"
      );
      ditherjs32Color.dither(options48colorImage, options48color);
    }
  };

  return (
    <div className="container">
      {/* Upload image button */}
      {/* START */}
      <div className="offset-3 col-5 pt-5 mt-5">
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
              <div className="pt-5 mt-3 ">
                <Cropper
                  style={{ height: "50", width: "100%" }}
                  initialAspectRatio={1}
                  preview=".img-preview"
                  src={imageToBeUsed}
                  viewMode={1}
                  guides={true}
                  minCropBoxHeight={10}
                  minCropBoxWidth={10}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                  cropBoxResizable={false}
                  onInitialized={(instance) => {
                    setCropper(instance);
                  }}
                />
              </div>
              <button className="btn btn-primary" onClick={_crop}>
                Crop
              </button>
              {/* <div
                className="box pt-4 pb-4"
                style={{ width: "100%", float: "right" }}
              >
                <h1>Cropped Image</h1>
                <div
                  id="cropped-image"
                  className="img-preview"
                  style={{ width: "100%", height: "300px" }}
                />{" "}
              </div> */}

              {/* END */}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>

      {/* 4 option menu */}
      {/* START */}
      {imageToBeUsed != "" && croppedImage != "" ? (
        <>
          <div className="text-center alert alert-info mt-3">
            Please double click the button to dither
          </div>
          <div
            id="1"
            className="col-2 ml-5 btn btn-primary mt-2"
            onClick={ditherImage}
          >
            32x32 B&W
          </div>
          <div
            id="2"
            className="col-2 ml-5 btn btn-primary mt-2"
            onClick={ditherImage}
          >
            32x32 Colored
          </div>
          <div
            id="3"
            className="col-2 ml-5 btn btn-primary mt-2"
            onClick={ditherImage}
          >
            48x48 B&W
          </div>
          <div
            id="4"
            className="col-2 ml-5 btn btn-primary mt-2"
            onClick={ditherImage}
          >
            48x48 Colored
          </div>
        </>
      ) : (
        <></>
      )}

      {/* 4 option menu */}
      {/* END */}

      {/* DITHERING START */}
      {croppedImage != "" && currentImageID == "" ? (
        <>
          <div class="pt-5 m-2">
            <img
              // id="options32BWImage"
              src={croppedImage}
              height="640"
              width="640"
              // style={{ display: "none;" }}
            />
          </div>
        </>
      ) : (
        <>
          {currentImageID == "1" ? (
            <>
              <div class="pt-5 m-2">
                <img
                  id="options32BWImage"
                  src={croppedImage}
                  height="640"
                  width="640"
                  // style={{ display: "none;" }}
                />
              </div>
              <div class="input-group mt-3 pb-5 mb-4">
                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">
                    Wall Art Version
                  </label>
                </div>
                <select class="custom-select" id="inputGroupSelect01">
                  <option selected>Please Select One</option>
                  <option value="Box set version">Box set version($$)</option>
                  <option value="Assembled version">
                    Assembled version($$)
                  </option>
                </select>
              </div>
              <button className="btn btn-primary offset-3 col-5">Pay</button>
            </>
          ) : (
            <></>
          )}

          {currentImageID == "2" ? (
            <>
              <div class="pt-5 m-2">
                <img
                  id="options32colorImage"
                  src={croppedImage}
                  height="640"
                  width="640"
                  // style={{ display: "none;" }}
                />
              </div>
              <div class="input-group mt-3 pb-5 mb-4">
                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">
                    Wall Art Version
                  </label>
                </div>
                <select class="custom-select" id="inputGroupSelect01">
                  <option selected>Please Select One</option>
                  <option value="Box set version">Box set version($$)</option>
                  <option value="Assembled version">
                    Assembled version($$)
                  </option>
                </select>
              </div>
              <button className="btn btn-primary offset-3 col-5">Pay</button>
            </>
          ) : (
            <></>
          )}

          {currentImageID == "3" ? (
            <>
              <div class="pt-5 m-2">
                <img
                  id="options48BWImage"
                  src={croppedImage}
                  height="960"
                  width="960"
                  // style={{ display: "none;" }}
                />
              </div>
              <div class="input-group mt-3 pb-5 mb-4">
                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">
                    Wall Art Version
                  </label>
                </div>
                <select class="custom-select" id="inputGroupSelect01">
                  <option selected>Please Select One</option>
                  <option value="Box set version">Box set version($$)</option>
                  <option value="Assembled version">
                    Assembled version($$)
                  </option>
                </select>
              </div>
              <button className="btn btn-primary offset-3 col-5">Pay</button>
            </>
          ) : (
            <></>
          )}
          {currentImageID == "4" ? (
            <>
              <div class="pt-5 m-2">
                <img
                  id="options48colorImage"
                  src={croppedImage}
                  height="960"
                  width="960"
                  // style={{ display: "none;" }}
                />
              </div>

              <div class="input-group mt-3 pb-5 mb-4">
                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">
                    Wall Art Version
                  </label>
                </div>
                <select class="custom-select" id="inputGroupSelect01">
                  <option selected>Please Select One</option>
                  <option value="Box set version">Box set version($$)</option>
                  <option value="Assembled version">
                    Assembled version($$)
                  </option>
                </select>
              </div>
              <button className="btn btn-primary offset-3 col-5">Pay</button>
            </>
          ) : (
            <></>
          )}
        </>
      )}

      {/* DITHERING END */}
    </div>
  );
}

export default App;
