import { BeatLoader } from "react-spinners";
import "./Loader.css";

interface LoaderProps {
  className?: string;
}

const Loader = ({ className = "" }: LoaderProps) => (
  <div className={className}>
    <BeatLoader color="#154b65" size={30} />
  </div>
);

export default Loader;
