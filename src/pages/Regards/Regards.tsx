import React from "react";
import Header from "../../components/Header/Header";
import "./Regards.css"

const Regards: React.FC = () => {
  return (
    <>
      <Header />
      <h2 className="regards">Благодарим за Вашу заявку!<br/> Мы ответим в ближайшее рабочее время</h2>
    </>
  );
};

export default Regards;
