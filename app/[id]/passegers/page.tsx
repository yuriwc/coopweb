import Breadcrumb from "@/src/components/breadcrumb";
import FormPassegers from "./form";

const App = () => {
  const url = [
    {
      name: "Inicio",
      url: "#",
    },
    {
      name: "Cadastrar Passageiro",
      url: "/passegers",
    },
  ];
  return (
    <section>
      <Breadcrumb items={url} />
      <FormPassegers />
    </section>
  );
};

export default App;
