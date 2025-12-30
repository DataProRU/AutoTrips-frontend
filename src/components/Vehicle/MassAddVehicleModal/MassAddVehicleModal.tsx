import { useState } from "react";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";
import vehicleStore from "../../../store/VehicleStore";
import MessageBox from "../../../ui/MessageBox/MessageBox";
import Loader from "../../../ui/Loader/Loader";
import "./MassAddVehicleModal.css";
import { observer } from "mobx-react";
import Button from "../../../ui/Button/Button";

interface MassAddVehicleModalProps {
  onClose: () => void;
  userId: number;
  onSuccess: () => void;
}

const MassAddVehicleModal = observer(
  ({ onClose, userId, onSuccess }: MassAddVehicleModalProps) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    };

    const handleUpload = async () => {
      if (!file) return;

      setIsLoading(true);
      try {
        await vehicleStore.uploadExcel(userId, file);
        MessageBox({
          title: t("common.ui.successTitle"),
          message: t("common.ui.successMessage"),
          onClose: () => {
            onSuccess();
            onClose();
          },
          buttonText: t("common.ui.okButton"),
        });
      } catch (error) {
        let errorMessage =
          t("common.ui.errorMessage") + " " + (error as Error).message;
        const axiosError = error as {
          response?: {
            data?: {
              excel_file?: string[];
              errors?: Array<{ row: string; vin: string; error: string }>;
            };
          };
        };

        if (axiosError.response?.data?.errors) {
          errorMessage = axiosError.response.data.errors
            .map((err) => err.error)
            .join("\n");
        } else if (axiosError.response?.data?.excel_file) {
          errorMessage = axiosError.response.data.excel_file.join(", ");
        }

        MessageBox({
          title: t("common.ui.errorTitle"),
          message: errorMessage,
          onClose: () => {},
          buttonText: t("common.ui.okButton"),
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Modal
        isOpen={true}
        onRequestClose={onClose}
        className="mass-add-modal"
        overlayClassName="mass-add-modal-overlay"
        ariaHideApp={false}
      >
        <div className="mass-add-content">
          <h2 className="mass-add__title">
            {t("vehicleModal.massAdd.ui.title")}
          </h2>

          <div className="mass-add__requirements">
            <div className="mass-add__requirements-title">
              {t("vehicleModal.massAdd.ui.requirementsTitle")}
            </div>
            <div>{t("vehicleModal.massAdd.ui.formatRequirement")}</div>
            <div>{t("vehicleModal.massAdd.ui.columnARequirement")}</div>
            <div>{t("vehicleModal.massAdd.ui.columnBRequirement")}</div>
            <br />
            <div>{t("vehicleModal.massAdd.ui.rowRequirement")}</div>
            <div>{t("vehicleModal.massAdd.ui.headerRequirement")}</div>
          </div>

          <div className="mass-add__example-title">
            {t("vehicleModal.massAdd.ui.exampleTitle")}
          </div>
          <table className="mass-add__example-table">
            <thead>
              <tr>
                <th></th>
                <th>A</th>
                <th>B</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <b>{t("vehicleModal.massAdd.ui.makeModelYear")}</b>
                </td>
                <td>
                  <b>{t("vehicleModal.massAdd.ui.vin")}</b>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>BMW X7 2025</td>
                <td>123456789012345</td>
              </tr>
              <tr>
                <td>3</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div
            className="mass-add__file-input-container"
            onClick={() => document.getElementById("excel-upload")?.click()}
          >
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls"
              hidden
              onChange={handleFileChange}
            />
            <div>
              {file
                ? t("vehicleModal.massAdd.ui.fileSelected")
                : t("vehicleModal.massAdd.ui.attachFile")}
            </div>
            {file && <div className="mass-add__file-name">{file.name}</div>}
          </div>

          {isLoading ? (
            <div className="mass-add__loader">
              <Loader />
            </div>
          ) : (
            <Button
              type="button"
              text={t("vehicleModal.massAdd.ui.uploadBtn")}
              className="link mass-add__upload-btn"
              onClick={handleUpload}
              disabled={!file}
            />
          )}

          <Button
            type="button"
            text={t("common.ui.back")}
            className="link warning "
            onClick={onClose}
          />
        </div>
      </Modal>
    );
  }
);

export default MassAddVehicleModal;
