import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/pages/HomePage';
import { WeaponsPage } from './components/pages/WeaponsPage';
import { WeaponDetailPage } from './components/pages/WeaponDetailPage';
import { EnemiesPage } from './components/pages/EnemiesPage';
import { NPCsPage } from './components/pages/NPCsPage';
import { BiomesPage } from './components/pages/BiomesPage';
import { ItemsPage } from './components/pages/ItemsPage';
import { NotFound } from './components/pages/NotFound';
import { Layout } from './components/common/Layout';

/**
 * Componente raiz da aplicação
 * Gerencia todas as rotas do Terraria Calamity RPG
 */
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Weapons */}
          <Route path="/weapons" element={<WeaponsPage />} />
          <Route path="/weapons/:id" element={<WeaponDetailPage />} />

          {/* Enemies */}
          <Route path="/enemies" element={<EnemiesPage />} />

          {/* NPCs */}
          <Route path="/npcs" element={<NPCsPage />} />

          {/* Biomes */}
          <Route path="/biomes" element={<BiomesPage />} />

          {/* Items */}
          <Route path="/items" element={<ItemsPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
