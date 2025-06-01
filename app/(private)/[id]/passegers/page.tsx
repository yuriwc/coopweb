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
      name: "Novo Colaborador",
      url: `/passegers/${params.id}`,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <Breadcrumb items={url} />
        <FormPassegers id={params.id} />
      </div>
    </div>
  );
};

export default App;
