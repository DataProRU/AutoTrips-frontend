import ComparisonsData from "../../components/ComparisonsData/ComparisonsData";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";

const Comparisons = () => {
    authStore.page = "Сравнение";
    
    return (
        <>
            <Header />
            <ComparisonsData />
        </>
    )
}

export default Comparisons;