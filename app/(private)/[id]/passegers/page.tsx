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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={url} />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
            <svg
              className="w-7 h-7 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Cadastrar Novo Colaborador
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto text-sm">
            Preencha as informações abaixo para cadastrar um novo colaborador no sistema
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <FormPassegers id={params.id} />
        </div>
      </div>
    </div>
  );
};

export default App;
