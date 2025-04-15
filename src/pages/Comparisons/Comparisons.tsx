import { useTranslation } from "react-i18next";
import ComparisonsData from "../../components/ComparisonsData/ComparisonsData";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";

const Comparisons = () => {
  const { t } = useTranslation();
  authStore.page = t("comparisonsData.ui.pageTitle");

  return (
    <>
      <Header />
      <ComparisonsData />
    </>
  );
};

export default Comparisons;
