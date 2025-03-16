import React from "react";
import $api from "../../setup/http";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import authStore from "../../store/AuthStore";



export const LogoutButton: React.FC = observer(() => {
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    await authStore.logout();
    navigate("/auth"); 
  };

  return <button onClick={handleLogout}>Logout</button>;
});


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
      <LogoutButton/>
    </div>
  );
};

export default Regards;
