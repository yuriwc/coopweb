import Breadcrumb from "@/src/components/breadcrumb";
import FormPassegers from "./form";

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
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
      <FormPassegers id={params.id} />
    </section>
  );
};

export default App;
