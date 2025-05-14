import Breadcrumb from "@/src/components/breadcrumb";
import FormPassegers from "./form";

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const url = [
    {
      name: "Início",
      url: `/${params.id}`,
    },
    {
      name: "Novo Passageiro",
      url: `/passegers/${params.id}`,
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
