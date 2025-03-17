import React from "react";
import $api from "../../setup/http";

const Regards: React.FC = () => {
  const fetchData = async (): Promise<void> => {
    try {
      const response = await $api.get("/accounts/users/current-user/");
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <h3>Благодарим за Вашу заявку!</h3>
      <h5>Мы ответим в ближайшее рабочее время</h5>
      <button onClick={fetchData}>Get Data</button>
    </div>
  );
};

export default Regards;
