import { Spinner } from "@heroui/spinner";

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl w-full pt-6 px-4 sm:px-6 lg:px-8">
        {/* Loading Container */}
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <Spinner
                size="lg"
                color="primary"
                classNames={{
                  circle1: "border-b-blue-500",
                  circle2: "border-b-sky-500",
                }}
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Carregando viagens...
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Aguarde enquanto buscamos seus dados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
