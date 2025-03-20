import { observer } from "mobx-react";
import "./CarAcceptanceData.css";
import Button from "../../ui/Button/Button";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import getTodayDate from "../../utils/getTodayDate";
import Select from "../../ui/Select/Select";
import FileUploader from "../../ui/FileUploader/FileUploader";
import InputField from "../../ui/Input/Input";

const schema = z.object({
  acceptanceDate: z.string().min(1, "Дата принятия обязательно для заполнения"),
  vinNumber: z.string().min(1, "VIN номер обязателен"),
  carPhotos: z
    .array(z.instanceof(File))
    .min(1, "Загрузите хотя бы одно фото")
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "Каждый файл должен быть меньше 5MB"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "image/gif"].includes(file.type)
        ),
      "Поддерживаются только форматы JPEG, PNG и GIF"
    ),
  keyPhotos: z
    .array(z.instanceof(File))
    .min(1, "Загрузите хотя бы одно фото")
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "Каждый файл должен быть меньше 5MB"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "image/gif"].includes(file.type)
        ),
      "Поддерживаются только форматы JPEG, PNG и GIF"
    ),
  docsPhotos: z
    .array(z.instanceof(File))
    .min(1, "Загрузите хотя бы одно фото")
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "Каждый файл должен быть меньше 5MB"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "image/gif"].includes(file.type)
        ),
      "Поддерживаются только форматы JPEG, PNG и GIF"
    ),
  place: z.string().min(1, "Расположение авто обязательно"),
});

type CarAcceptanceFormData = z.infer<typeof schema>;

const CarAcceptanceData = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CarAcceptanceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      carPhotos: [],
      keyPhotos: [],
      docsPhotos: [],
    },
  });

  const vinOptions = [
    { value: "1HGBH41JXMN109186", label: "1HGBH41JXMN109186" },
    { value: "2HGFA16508H000001", label: "2HGFA16508H000001" },
    { value: "3VWFE21C04M000001", label: "3VWFE21C04M000001" },
  ];

  const onSubmit = (data: CarAcceptanceFormData) => {
    console.log("Form data:", data);
  };

  return (
    <div className="acceptance__form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="input acceptance__date">
          Дата принятия: {getTodayDate()}
        </p>
        <Select
          name="vinNumber"
          control={control}
          options={vinOptions}
          placeholder="VIN номер"
          error={errors.vinNumber}
        />

        <p className="acceptance__text">Марка: [марка автомобиля]</p>
        <Button type="button" text="Сравнить модель" className="link acceptance__comparison" />

        <div className="group">
          <label className="label">
            Фото автомобиля (экстерьер/интерьер){" "}
            <span className="label-required">*</span>
          </label>
          <Controller
            name="carPhotos"
            control={control}
            render={({ field }) => (
              <FileUploader
                onFilesSelected={(files) => {
                  field.onChange(Array.from(files));
                }}
              />
            )}
          />
          {errors.carPhotos && (
            <span className="error error-photos">
              {errors.carPhotos.message}
            </span>
          )}
        </div>

        <div className="group">
          <label className="label">
            Фото ключа <span className="label-required">*</span>
          </label>
          <Controller
            name="keyPhotos"
            control={control}
            render={({ field }) => (
              <FileUploader
                onFilesSelected={(files) => {
                  field.onChange(Array.from(files));
                }}
              />
            )}
          />
          {errors.keyPhotos && (
            <span className="error error-photos">
              {errors.keyPhotos.message}
            </span>
          )}
        </div>

        <div className="group">
          <label className="label">
            Фото документов <span className="label-required">*</span>
          </label>
          <Controller
            name="docsPhotos"
            control={control}
            render={({ field }) => (
              <FileUploader
                onFilesSelected={(files) => {
                  field.onChange(Array.from(files));
                }}
              />
            )}
          />
          {errors.docsPhotos && (
            <span className="error error-photos">
              {errors.docsPhotos.message}
            </span>
          )}
        </div>

        <InputField
          type="text"
          placeholder="Где находится авто"
          name="place"
          register={register}
          error={errors.place}
          className="input"
        />

        <input
          type="text"
          placeholder="Комментарий"
          name="notes"
          className="input acceptance__notes"
        />
        <div className="acceptance__btns">
          <Button
            type="submit"
            text="Принять авто"
            className="link acceptance__btn"
          />
          <div className="acceptance__damaged acceptance__btn">
            <Button type="submit" text="Повреждено" className="link warning" />
            <span className="acceptance__warning">
              *Отправим запрос в тех. поддержку
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default observer(CarAcceptanceData);
