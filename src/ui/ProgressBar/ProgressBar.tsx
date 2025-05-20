import Loader from "../Loader/Loader";
import "./ProgressBar.css";

interface ProgressBarProps {
  done?: number;
  total?: number;
}

const ProgressBar = ({ done, total }: ProgressBarProps) => {
  const showProgress = done !== undefined && total !== undefined;

  return (
    <div className="progress">
      <h3 className="progress__title">Пожалуйста, подождите, идет загрузка</h3>
      <p className="progress__text">
        Если в течении 2х минут ничего не произошло, перезагрузите страницу
      </p>
      <Loader className="progress__loader" />
      {showProgress && (
        <>
          <progress value={Number((done / total).toFixed(2))} max={1} />
          <p className="progress__text">
            {done} / {total}
          </p>
        </>
      )}
    </div>
  );
};

export default ProgressBar;
