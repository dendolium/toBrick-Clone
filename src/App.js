import React, { useState } from "react";
import Dropzone from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import * as imageConversion from "image-conversion";

function App() {
  const [cropper, setCropper] = useState(0);
  const [imageToBeUsed, setImageToBeUsed] = useState("");
  const [croppedImage, setCroppedImage] = useState("");

  //changing the image
  const changeImage = (files) => {
    setImageToBeUsed(files[0].name);

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

  return (
    <div className="container">
      {/* Upload image button */}
      {/* START */}
      <div className="offset-3 col-5 pt-5 mt-5">
        <div className="text-center">
          <Dropzone onDrop={(acceptedFiles) => changeImage(acceptedFiles)}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div
                  {...getRootProps()}
                  className="border p-5 custom-border-image"
                >
                  <input {...getInputProps()} />
                  <p>
                    {imageToBeUsed != ""
                      ? "Uploaded!"
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
              <div className="pt-5 mt-3">
                <Cropper
                  style={{ height: "100", width: "100%" }}
                  // initialAspectRatio={1}
                  preview=".img-preview"
                  src={imageToBeUsed}
                  viewMode={1}
                  guides={true}
                  // minCropBoxHeight={10}
                  // minCropBoxWidth={10}
                  background={false}
                  // responsive={true}
                  // autoCropArea={1}
                  checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                  onInitialized={(instance) => {
                    setCropper(instance);
                  }}
                />
              </div>
              <div
                className="box pt-4 pb-4"
                style={{ width: "100%", float: "right" }}
              >
                <h1>Cropped Image</h1>
                <div
                  className="img-preview"
                  style={{ width: "100%", height: "300px" }}
                />{" "}
              </div>
              <div className="col-4 btn btn-primary" onClick={_crop}>
                Crop
              </div>
              {/* END */}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
