import Jimp from "jimp/";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { IDefaultBackImage } from "../App";
import { composeImage } from "../lib/convertFile";
import { handleFileSelect } from "../lib/fileSelect";
import { getBase64Image } from "../lib/uint8ToBase64";
import { DropDisplay } from "./lib/dropDisplay";
import { Modal } from "./lib/modal";
import { Settings } from "./Settings";

export const SettingsModal: React.FC<{
  setClose: () => void;
  defaultBackImage: IDefaultBackImage;
  onClose: () => void;
  setDefaultBackImage: (newDefault: IDefaultBackImage) => void;
}> = ({ setClose, defaultBackImage, setDefaultBackImage, onClose }) => {
  const [convertedPreviewImage, setConvertedPreviewImage] = useState<Buffer>(
    new Buffer(1024)
  );
  useEffect(() => {
    (async () => {
      const image = await composeImage(
        defaultBackImage.image,
        128,
        64,
        defaultBackImage.settings
      );
      setTimeout(() =>
        localStorage.setItem(
          "defaultBackImageSettings",
          JSON.stringify(defaultBackImage.settings)
        )
      );
      setConvertedPreviewImage(image);
    })();
  }, [defaultBackImage.image, defaultBackImage.settings]);
  const previewImage = useMemo(() => {
    const b64img = getBase64Image(convertedPreviewImage);
    return b64img;
  }, [convertedPreviewImage]);
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const buffer = await handleFileSelect(acceptedFiles[0]);
      const jimage = await Jimp.read(Buffer.from(buffer));
      const resizedBuffer = await jimage
        .scaleToFit(256, 128, "")
        .getBufferAsync("image/png");
      localStorage.setItem("defaultBackImage", JSON.stringify(resizedBuffer));
      setDefaultBackImage({ ...defaultBackImage, image: resizedBuffer });
    },
    [defaultBackImage, setDefaultBackImage]
  );
  return (
    <Modal
      setClose={() => {
        onClose();
        setClose();
      }}
      title="Default back button settings"
    >
      <DropDisplay
        deleteImage={() => console.log("delete image")}
        resetImage={true}
        onDrop={onDrop}
        previewImage={previewImage}
      />
      <Settings
        textOnly={false}
        imageSettings={defaultBackImage.settings.imageSettings}
        textSettings={defaultBackImage.settings.textSettings}
        textWithIconSettings={defaultBackImage.settings.textWithIconSettings}
        setImageSettings={(imageSettings) =>
          setDefaultBackImage({
            ...defaultBackImage,
            settings: { ...defaultBackImage.settings, imageSettings },
          })
        }
        setTextSettings={(textSettings) =>
          setDefaultBackImage({
            ...defaultBackImage,
            settings: { ...defaultBackImage.settings, textSettings },
          })
        }
        setTextWithIconSettings={(textWithIconSettings) =>
          setDefaultBackImage({
            ...defaultBackImage,
            settings: { ...defaultBackImage.settings, textWithIconSettings },
          })
        }
      />
    </Modal>
  );
};
