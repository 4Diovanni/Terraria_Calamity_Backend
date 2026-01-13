import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/pages/Home';
import { NotFound } from './components/pages/NotFound';
import { Layout } from './components/common/Layout';

/**
 * Componente raiz da aplicação
 * ❎ NÃO faz requisições aqui - deixe para páginas e componentes específicos!
 */
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
