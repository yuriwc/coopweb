const App = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-4 px-4 sm:px-8 border-t border-neutral-200 dark:border-neutral-800 bg-secondary">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-neutral-500 dark:text-neutral-400">
        <a
          className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>DESENVOLVIDO POR YURI CAVALCANTE</span>
        </a>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <a
          className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>EXAMPLES</span>
        </a>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <a
          className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>SUPORTE →</span>
        </a>
      </div>
    </footer>
  );
};

export default App;
